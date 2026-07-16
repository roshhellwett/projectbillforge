export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = "Too many requests",
    public readonly retryAfter?: number
  ) {
    super(message, "RATE_LIMITED", 429);
  }
}

export class BalanceError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "BALANCE_INCONSISTENT", 409, details);
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id?: string) {
    super(`${entity} not found${id ? `: ${id}` : ""}`, "NOT_FOUND", 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, details);
  }
}

export function serializeError(error: unknown, env?: string): { error: string } {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    } as { error: string };
  }
  if (env === "production") {
    return { error: "An unexpected error occurred", code: "INTERNAL_ERROR" } as { error: string };
  }
  return {
    error: error instanceof Error ? error.message : "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  } as { error: string };
}
