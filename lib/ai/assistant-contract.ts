import { z } from "zod";

/**
 * The public request boundary for the read-only business copilot.
 * Keep this module free of database/server imports so it can be contract-tested
 * with the repository's lightweight Node test runner.
 */
export const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2400),
      }),
    )
    .max(8)
    .default([]),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;
