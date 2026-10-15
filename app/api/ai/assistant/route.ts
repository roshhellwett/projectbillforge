import { NextResponse } from "next/server";

import {
  askBusinessAssistant,
  AssistantError,
} from "@/lib/ai/assistant";
import { assistantRequestSchema } from "@/lib/ai/assistant-contract";
import { AuthError } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "Send a valid JSON request.");
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      422,
      "VALIDATION_ERROR",
      "Ask a question between 1 and 1,200 characters.",
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
