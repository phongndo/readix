import { Effect } from 'effect';
import { CreateBookInput, BookId, UserId, type Book } from '$lib/domain/book/Book';
import {
	DatabaseError,
	NotFoundError,
	ValidationError,
	type AppError
} from '$lib/server/effect/errors';
import { calculateProgressPercentage } from '$lib/domain/book/bookRules';
import { convexClient } from '$lib/convex/client';
import { api } from '$lib/convex/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convexBookToDomain(doc: any): Book {
	return {
		id: BookId.make(doc._id),
		userId: UserId.make(doc.userId),
		title: doc.title,
		author: doc.author,
		description: doc.description ?? '',
		coverUrl: doc.coverUrl ?? '',
		totalPages: doc.totalPages,
		currentPage: doc.currentPage,
		content: doc.content,
		isCompleted: doc.isCompleted,
		createdAt: new Date(doc.createdAt),
		updatedAt: new Date(doc.updatedAt)
	};
}

export function fetchBooksByUser(userId: string): Effect.Effect<Book[], AppError> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.books.getByUser, { userId }),
		catch: (error) => new DatabaseError('Failed to fetch books', error)
	}).pipe(Effect.map((docs) => docs.map(convexBookToDomain)));
}

export function fetchBookById(bookId: string, userId: string): Effect.Effect<Book, AppError> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.books.getById, { bookId, userId }),
		catch: (error) => new DatabaseError('Failed to fetch book', error)
	}).pipe(
		Effect.flatMap((doc) =>
			doc
				? Effect.succeed(convexBookToDomain(doc))
				: Effect.fail(new NotFoundError('Book not found', 'Book', bookId))
		)
	);
}

export function createBook(userId: string, input: CreateBookInput): Effect.Effect<Book, AppError> {
	return Effect.gen(function* () {
		const validated = yield* Effect.try({
			try: () => input,
			catch: (error) => new ValidationError(`Invalid book data: ${error}`, 'input')
		});

		const bookId = yield* Effect.tryPromise({
			try: () =>
				convexClient.mutation(api.books.create, {
					userId,
					title: validated.title,
					author: validated.author,
					description: validated.description,
					coverUrl: validated.coverUrl,
					totalPages: validated.totalPages,
					content: validated.content
				}),
			catch: (error) => new DatabaseError('Failed to create book', error)
		});

		return yield* fetchBookById(bookId, userId);
	});
}

export function updateBookProgress(
	bookId: string,
	userId: string,
	newPage: number
): Effect.Effect<Book, AppError> {
	return Effect.gen(function* () {
		const book = yield* fetchBookById(bookId, userId);

		if (newPage < 0 || newPage > book.totalPages) {
			return yield* Effect.fail(
				new ValidationError(
					`Invalid page number: ${newPage}. Must be between 0 and ${book.totalPages}`,
					'currentPage'
				)
			);
		}

		const updated = yield* Effect.tryPromise({
			try: () => convexClient.mutation(api.books.updateProgress, { bookId, userId, newPage }),
			catch: (error) => new DatabaseError('Failed to update book progress', error)
		});

		return convexBookToDomain(updated);
	});
}

export function deleteBook(bookId: string, userId: string): Effect.Effect<void, AppError> {
	return Effect.tryPromise({
		try: () => convexClient.mutation(api.books.remove, { bookId, userId }),
		catch: (error) => new DatabaseError('Failed to delete book', error)
	}).pipe(Effect.map(() => undefined));
}

export function getBookProgress(book: Book): number {
	return calculateProgressPercentage(book);
}
