import { Effect } from 'effect';

export class DatabaseError extends Error {
	readonly _tag = 'DatabaseError';
	constructor(
		readonly message: string,
		readonly cause?: unknown
	) {
		super(message);
		this.name = 'DatabaseError';
	}
}

export class ValidationError extends Error {
	readonly _tag = 'ValidationError';
	constructor(
		readonly message: string,
		readonly field?: string
	) {
		super(message);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends Error {
	readonly _tag = 'NotFoundError';
	constructor(
		readonly message: string,
		readonly resource: string,
		readonly id: string
	) {
		super(message);
		this.name = 'NotFoundError';
	}
}

export class UnauthorizedError extends Error {
	readonly _tag = 'UnauthorizedError';
	constructor(readonly message: string = 'Unauthorized') {
		super(message);
		this.name = 'UnauthorizedError';
	}
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
