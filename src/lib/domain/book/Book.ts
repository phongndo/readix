import { Schema } from 'effect';

export const BookId = Schema.String.pipe(Schema.brand('BookId'));
export type BookId = typeof BookId.Type;

export const UserId = Schema.String.pipe(Schema.brand('UserId'));
export type UserId = typeof UserId.Type;

export const BookSchema = Schema.Struct({
	id: BookId,
	userId: UserId,
	title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(255)),
	author: Schema.optionalWith(Schema.String.pipe(Schema.minLength(1), Schema.maxLength(255)), {
		default: () => 'Unknown Author'
	}),
	description: Schema.optionalWith(Schema.String, { default: () => '' }),
	coverUrl: Schema.optionalWith(Schema.String, { default: () => '' }),
	totalPages: Schema.Number.pipe(Schema.int(), Schema.positive()),
	currentPage: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	content: Schema.String,
	isCompleted: Schema.Boolean,
	createdAt: Schema.DateFromNumber,
	updatedAt: Schema.DateFromNumber
});

export type Book = typeof BookSchema.Type;

export const CreateBookInput = Schema.Struct({
	title: Schema.String.pipe(Schema.minLength(1), Schema.maxLength(255)),
	author: Schema.optionalWith(Schema.String.pipe(Schema.minLength(1), Schema.maxLength(255)), {
		as: 'Option'
	}),
	description: Schema.optionalWith(Schema.String, { as: 'Option' }),
	coverUrl: Schema.optionalWith(Schema.String, { as: 'Option' }),
	totalPages: Schema.Number.pipe(Schema.int(), Schema.positive()),
	content: Schema.String.pipe(Schema.minLength(1))
});

export type CreateBookInput = typeof CreateBookInput.Type;
