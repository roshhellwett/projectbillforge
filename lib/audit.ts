import { db } from "@/lib/db";
import { auditLog } from "@/lib/schema";

export type AuditEvent = {
  businessId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  createdBy?: string;
};

function computeDelta(
  prev: Record<string, unknown> | null | undefined,
  next: Record<string, unknown> | null | undefined
): Record<string, { from: unknown; to: unknown }> | null {
  if (!prev || !next) return null;
  const delta: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

  for (const key of allKeys) {
    const pVal = JSON.stringify(prev[key]);
    const nVal = JSON.stringify(next[key]);
    if (pVal !== nVal) {
      delta[key] = { from: prev[key], to: next[key] };
    }
  }

  return Object.keys(delta).length > 0 ? delta : null;
}

export async function logAuditEvent(event: AuditEvent): Promise<void> {
  const delta = computeDelta(event.previousState, event.newState);

  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    businessId: event.businessId,
    actionType: event.actionType,
    entityType: event.entityType,
    entityId: event.entityId,
    previousState: event.previousState ?? null,
    newState: event.newState ?? null,
    delta: delta as Record<string, unknown> | null,
    createdBy: event.createdBy ?? null,
  });
}
