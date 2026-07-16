import { db } from "@/lib/db";
import { idempotencyKeys } from "@/lib/schema";
import { eq, lt } from "drizzle-orm";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export async function getCachedResponse<T>(key: string): Promise<T | null> {
  const [row] = await db.select()
    .from(idempotencyKeys)
    .where(eq(idempotencyKeys.key, key))
    .limit(1);

  if (!row) return null;

  if (!row.createdAt || Date.now() - new Date(row.createdAt).getTime() > IDEMPOTENCY_TTL_MS) {
    await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    return null;
  }

  return row.response as T;
}

export async function cacheResponse<T>(key: string, response: T): Promise<void> {
  await db.insert(idempotencyKeys).values({
    key,
    response: response as Record<string, unknown>,
  });
}

export async function withIdempotency<T>(
  key: string | undefined,
  handler: () => Promise<T>
): Promise<T> {
  if (!key) return handler();

  const cached = await getCachedResponse<T>(key);
  if (cached !== null) return cached;

  const result = await handler();
  await cacheResponse(key, result);
  return result;
}

export async function cleanupExpiredKeys(): Promise<number> {
  const cutoff = new Date(Date.now() - IDEMPOTENCY_TTL_MS);
  const result = await db.delete(idempotencyKeys)
    .where(lt(idempotencyKeys.createdAt, cutoff));
  return result.length ?? 0;
}
