import { Schema } from 'effect';
import { BookId, UserId } from '../book/Book';

export const ReadingSessionId = Schema.String.pipe(Schema.brand('ReadingSessionId'));
export type ReadingSessionId = typeof ReadingSessionId.Type;

export const ReadingSessionSchema = Schema.Struct({
	id: ReadingSessionId,
	bookId: BookId,
	userId: UserId,
	startPage: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	endPage: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	durationMinutes: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	createdAt: Schema.DateFromNumber
});

export type ReadingSession = typeof ReadingSessionSchema.Type;

export const CreateReadingSessionInput = Schema.Struct({
	bookId: BookId,
	startPage: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	endPage: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	durationMinutes: Schema.Number.pipe(Schema.int(), Schema.nonNegative())
});

export type CreateReadingSessionInput = typeof CreateReadingSessionInput.Type;

export function calculatePagesRead(session: ReadingSession): number {
	return Math.max(0, session.endPage - session.startPage);
}

export function calculateReadingSpeed(session: ReadingSession): number {
	const pages = calculatePagesRead(session);
	if (session.durationMinutes === 0) return 0;
	return Math.round(pages / session.durationMinutes);
}
