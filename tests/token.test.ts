import test from "node:test";
import assert from "node:assert/strict";

import { hashToken } from "../lib/token.ts";

test("verification tokens are stored as deterministic one-way digests", () => {
  const raw = "email-verification-token";
  const digest = hashToken(raw);

  assert.equal(digest, hashToken(raw));
  assert.equal(digest.length, 64);
  assert.notEqual(digest, raw);
  assert.notEqual(digest, hashToken(`${raw}-different`));
});
