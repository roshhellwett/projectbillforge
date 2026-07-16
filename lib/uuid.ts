import { ValidationError } from "./errors";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuid(value: string, name: string): asserts value is string {
  if (!UUID_REGEX.test(value)) {
    throw new ValidationError(`Invalid ${name}: must be a valid UUID`);
  }
}

export function validateUuidOrUndefined(value: string | undefined | null, name: string): void {
  if (value == null) return;
  validateUuid(value, name);
}
