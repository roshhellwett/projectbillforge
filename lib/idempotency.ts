import { db } from "@/lib/db";
import { idempotencyKeys } from "@/lib/schema";
import { eq, lt } from "drizzle-orm";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const PENDING_LEASE_MS = 5 * 60 * 1000;
const PENDING_MARKER = "__billforge_pending__";

type PendingMarker = { [PENDING_MARKER]: true };

function isPendingMarker(value: unknown): value is PendingMarker {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as Record<string, unknown>)[PENDING_MARKER] === true,
  );
}

function isCacheableResult(value: unknown): boolean {
  if (!value || typeof value !== "object") return true;
  return !("error" in value && !("success" in value));
}

async function readRecord(key: string) {
  const [row] = await db
    .select({ response: idempotencyKeys.response, createdAt: idempotencyKeys.createdAt })
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .limit(1);

  if (!row) return null;

  if (!row.createdAt || Date.now() - new Date(row.createdAt).getTime() > IDEMPOTENCY_TTL_MS) {
    await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    return null;
  }

  return row;
}

async function waitForCompletedResponse<T>(key: string): Promise<T | null> {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const row = await readRecord(key);
    if (!row) return null;
    if (!isPendingMarker(row.response)) return row.response as T;

    const age = row.createdAt ? Date.now() - new Date(row.createdAt).getTime() : 0;
    if (age > PENDING_LEASE_MS) {
      await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

export async function getCachedResponse<T>(key: string): Promise<T | null> {
  const row = await readRecord(key);
  if (!row || isPendingMarker(row.response)) return null;
  return row.response as T;
}

export async function cacheResponse<T>(key: string, response: T): Promise<void> {
  await db
    .update(idempotencyKeys)
    .set({ response: response as Record<string, unknown> })
    .where(eq(idempotencyKeys.key, key));
}

export async function withIdempotency<T>(
  key: string | undefined,
  handler: () => Promise<T>
): Promise<T> {
  if (!key) return handler();

  for (let claimAttempt = 0; claimAttempt < 3; claimAttempt += 1) {
    const cached = await getCachedResponse<T>(key);
    if (cached !== null) return cached;

    const [claimed] = await db
      .insert(idempotencyKeys)
      .values({ key, response: { [PENDING_MARKER]: true } })
      .onConflictDoNothing({ target: idempotencyKeys.key })
      .returning({ key: idempotencyKeys.key });

    if (!claimed) {
      const completed = await waitForCompletedResponse<T>(key);
      if (completed !== null) return completed;
      continue;
    }

    try {
      const result = await handler();
      if (isCacheableResult(result)) {
        await cacheResponse(key, result);
      } else {
        await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
      }
      return result;
    } catch (error) {
      await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
      throw error;
    }
  }

  throw new Error("Could not safely claim the idempotency key. Please retry.");
}

export async function cleanupExpiredKeys(): Promise<number> {
  const cutoff = new Date(Date.now() - IDEMPOTENCY_TTL_MS);
  const result = await db.delete(idempotencyKeys)
    .where(lt(idempotencyKeys.createdAt, cutoff));
  return Number((result as { rowCount?: number }).rowCount ?? 0);
}
