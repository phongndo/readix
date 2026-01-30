import { Effect } from 'effect';

export class DatabaseError {
	readonly _tag = 'DatabaseError';
	constructor(
		readonly message: string,
		readonly cause?: unknown
	) {}
}

export class ValidationError {
	readonly _tag = 'ValidationError';
	constructor(
		readonly message: string,
		readonly field?: string
	) {}
}

export class NotFoundError {
	readonly _tag = 'NotFoundError';
	constructor(
		readonly message: string,
		readonly resource: string,
		readonly id: string
	) {}
}

export class UnauthorizedError {
	readonly _tag = 'UnauthorizedError';
	constructor(readonly message: string = 'Unauthorized') {}
}

export type AppError = DatabaseError | ValidationError | NotFoundError | UnauthorizedError;

export function toEffectError(error: unknown): Effect.Effect<never, AppError> {
	if (error instanceof DatabaseError) {
		return Effect.fail(error);
	}
	if (error instanceof ValidationError) {
		return Effect.fail(error);
	}
	if (error instanceof NotFoundError) {
		return Effect.fail(error);
	}
	if (error instanceof UnauthorizedError) {
		return Effect.fail(error);
	}
	return Effect.fail(new DatabaseError('Unknown error', error));
}
