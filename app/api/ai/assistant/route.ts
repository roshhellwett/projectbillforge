import { NextResponse } from "next/server";

import {
  askBusinessAssistant,
  AssistantError,
  getAssistantReadiness,
} from "@/lib/ai/assistant";
import {
  ASSISTANT_MAX_MESSAGE_LENGTH,
  assistantRequestSchema,
} from "@/lib/ai/assistant-contract";
import { AuthError } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_REQUEST_BODY_LENGTH = 64 * 1024;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}

export async function GET() {
  try {
    const readiness = await getAssistantReadiness();
    return NextResponse.json(
      { data: readiness },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(401, "UNAUTHORIZED", "Sign in to check copilot readiness.");
    }

    console.error("Business assistant readiness request failed", error);
    return errorResponse(
      503,
      "AI_READINESS_UNKNOWN",
      "Copilot readiness could not be checked. Please try again.",
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    const rawBody = await request.text();
    if (rawBody.length > MAX_REQUEST_BODY_LENGTH) {
      return errorResponse(413, "PAYLOAD_TOO_LARGE", "The copilot request is too large.");
    }
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse(400, "INVALID_JSON", "Send a valid JSON request.");
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      422,
      "VALIDATION_ERROR",
      `Ask a question between 1 and ${ASSISTANT_MAX_MESSAGE_LENGTH.toLocaleString("en-US")} characters.`,
    );
  }

  try {
    const result = await askBusinessAssistant(parsed.data);
    return NextResponse.json(
      { data: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(401, "UNAUTHORIZED", "Sign in to use the business copilot.");
    }

    if (error instanceof AssistantError) {
      return errorResponse(error.status, error.code, error.message);
    }

    console.error("Business assistant request failed", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "The copilot could not answer right now. Please try again.",
    );
  }
}
