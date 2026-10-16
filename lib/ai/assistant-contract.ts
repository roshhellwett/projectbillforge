import { z } from "zod";

/**
 * The public request boundary for the read-only business copilot.
 * Keep this module free of database/server imports so it can be contract-tested
 * with the repository's lightweight Node test runner.
 */
export const ASSISTANT_MAX_MESSAGE_LENGTH = 1200;
export const ASSISTANT_MAX_HISTORY_MESSAGES = 8;
export const ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH = 2400;
export const ASSISTANT_MAX_ANSWER_LENGTH = 5000;

export type AssistantHistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

const assistantHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH),
});

export const assistantRequestSchema = z.object({
  message: z.string().trim().min(1).max(ASSISTANT_MAX_MESSAGE_LENGTH),
  history: z.array(assistantHistoryMessageSchema).max(ASSISTANT_MAX_HISTORY_MESSAGES).default([]),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

const assistantScopeSchema = z.object({
  readOnly: z.literal(true),
  context: z.enum(["available", "empty"]),
  timeWindowDays: z.number().int().positive(),
  maxRowsPerList: z.number().int().positive(),
});

const assistantSuccessResponseSchema = z.object({
  data: z.object({
    answer: z.string().trim().min(1).max(ASSISTANT_MAX_ANSWER_LENGTH),
    generatedAt: z.string().trim().min(1).max(100),
    scope: assistantScopeSchema.optional(),
  }),
});

const assistantErrorResponseSchema = z.object({
  error: z.object({
    code: z.string().trim().min(1).max(80),
    message: z.string().trim().min(1).max(500),
  }),
});

export type AssistantSuccessResponse = z.infer<typeof assistantSuccessResponseSchema>;
export type AssistantErrorResponse = z.infer<typeof assistantErrorResponseSchema>;

export type ParsedAssistantResponse =
  | { kind: "success"; data: AssistantSuccessResponse["data"] }
  | { kind: "error"; error: AssistantErrorResponse["error"] }
  | { kind: "invalid" };

/**
 * Parse an unknown API payload without trusting the shape asserted by JSON.
 * The UI uses this for both successful and failed responses, including HTML or
 * otherwise malformed responses from a proxy or upstream failure.
 */
export function parseAssistantResponse(value: unknown): ParsedAssistantResponse {
  const success = assistantSuccessResponseSchema.safeParse(value);
  if (success.success) {
    return { kind: "success", data: success.data.data };
  }

  const failure = assistantErrorResponseSchema.safeParse(value);
  if (failure.success) {
    return { kind: "error", error: failure.data.error };
  }

  return { kind: "invalid" };
}

export const assistantReadinessDataSchema = z.object({
  provider: z.enum(["configured", "not_configured", "unknown"]),
  data: z.enum(["available", "empty", "unavailable", "unknown"]),
  checkedAt: z.string().trim().min(1).max(100),
});

const assistantReadinessResponseSchema = z.object({
  data: assistantReadinessDataSchema,
});

export type AssistantReadinessData = z.infer<typeof assistantReadinessDataSchema>;

/** Parse the non-sensitive readiness response returned by the server. */
export function parseAssistantReadinessResponse(value: unknown): AssistantReadinessData | null {
  const parsed = assistantReadinessResponseSchema.safeParse(value);
  return parsed.success ? parsed.data.data : null;
}

/**
 * Keep conversation history bounded before it reaches the request schema.
 * This is deliberately lossy: old or very long messages are not needed to
 * answer the current question and must not make a retry fail validation.
 */
export function boundAssistantHistory(
  history: readonly AssistantHistoryMessage[],
): AssistantHistoryMessage[] {
  return history
    .flatMap((message) => {
      if (
        !message ||
        (message.role !== "user" && message.role !== "assistant") ||
        typeof message.content !== "string"
      ) {
        return [];
      }

      const content = message.content.trim().slice(0, ASSISTANT_MAX_HISTORY_MESSAGE_LENGTH);
      return content ? [{ role: message.role, content }] : [];
    })
    .slice(-ASSISTANT_MAX_HISTORY_MESSAGES);
}
