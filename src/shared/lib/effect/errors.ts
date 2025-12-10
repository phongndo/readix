import { Data } from 'effect';
// Database errors
export class DatabaseError extends Data.TaggedError('DatabaseError')<{
	message: string;
	cause?: unknown;
}> {}
export class NotFoundError extends Data.TaggedError('NotFoundError')<{
	resource: string;
	id: string;
}> {}
// Validation errors
export class ValidationError extends Data.TaggedError('ValidationError')<{
	message: string;
	errors: Array<{ path: string; message: string }>;
}> {}
// External service errors
export class EmbeddingError extends Data.TaggedError('EmbeddingError')<{
	message: string;
	cause?: unknown;
}> {}
export class StorageError extends Data.TaggedError('StorageError')<{
	message: string;
	cause?: unknown;
}> {}
// Auth errors
export class AuthError extends Data.TaggedError('AuthError')<{
	message: string;
	code?: string;
}> {}

import { ArrayFormatter } from '@effect/schema';
import type { ParseError } from '@effect/schema/ParseResult';
/**
 * Converts Effect Schema ParseError to form-friendly field errors
 * Similar to Zod's error.flatten().fieldErrors
 */
export function formatSchemaErrors(error: ParseError): Record<string, string[]> {
	const formatted = ArrayFormatter.formatErrorSync(error);
	const fieldErrors: Record<string, string[]> = {};
	for (const issue of formatted) {
		const path = issue.path.join('.') || 'form';
		if (!fieldErrors[path]) {
			fieldErrors[path] = [];
		}
		fieldErrors[path].push(issue.message);
	}
	return fieldErrors;
}
