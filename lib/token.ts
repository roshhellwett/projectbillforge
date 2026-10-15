import { createHash } from "node:crypto";

/** Store one-way token digests so a database read cannot be used to redeem links. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
