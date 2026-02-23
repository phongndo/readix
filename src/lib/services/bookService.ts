import { Effect, Option } from 'effect';
import { CreateBookInput, BookId, UserId, type Book } from '$lib/domain/book/Book';
import { DatabaseError, NotFoundError, ValidationError, type AppError } from '$lib/effect/errors';
import { calculateProgressPercentage } from '$lib/domain/book/bookRules';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';
import { generateFirstPageThumbnail } from '$lib/services/document/pdf-thumbnail';

export type DeletePreview = {
	bookId: string;
	title: string;
	fileName: string | null;
	hasStoredFile: boolean;
	counts: {
		bookContent: number;
		documentText: number;
		readingPositions: number;
		bookmarks: number;
		annotations: number;
		readingSessions: number;
		fileStorage: number;
	};
	totalRecords: number;
};

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
		// File fields
		fileStorageId: doc.fileStorageId ?? undefined,
		fileName: doc.fileName ?? undefined,
		fileType: doc.fileType ?? undefined,
		fileSize: doc.fileSize ?? undefined,
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
		try: () => convexClient.query(api.books.getById, { bookId: bookId as Id<'books'>, userId }),
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
					author: Option.getOrUndefined(validated.author),
					description: Option.getOrUndefined(validated.description),
					coverUrl: Option.getOrUndefined(validated.coverUrl),
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
			try: () =>
				convexClient.mutation(api.books.updateProgress, {
					bookId: bookId as Id<'books'>,
					userId,
					newPage
				}),
			catch: (error) => new DatabaseError('Failed to update book progress', error)
		});

		return convexBookToDomain(updated);
	});
}

export function deleteBook(bookId: string, userId: string): Effect.Effect<void, AppError> {
	return Effect.tryPromise({
		try: () => convexClient.mutation(api.books.remove, { bookId: bookId as Id<'books'>, userId }),
		catch: (error) => new DatabaseError('Failed to delete book', error)
	}).pipe(Effect.map(() => undefined));
}

export function fetchDeletePreview(
	bookId: string,
	userId: string
): Effect.Effect<DeletePreview, AppError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.query(api.books.getDeletePreview, {
				bookId: bookId as Id<'books'>,
				userId
			}),
		catch: (error) => new DatabaseError('Failed to fetch delete preview', error)
	}).pipe(
		Effect.flatMap((result) =>
			result
				? Effect.succeed({
						bookId: result.bookId,
						title: result.title,
						fileName: result.fileName,
						hasStoredFile: result.hasStoredFile,
						counts: result.counts,
						totalRecords: result.totalRecords
					})
				: Effect.fail(new NotFoundError('Book not found', 'Book', bookId))
		)
	);
}

export function getBookProgress(book: Book): number {
	return calculateProgressPercentage(book);
}

/**
 * Upload a book file and create a book record.
 * This performs a 3-step process:
 * 1. Get upload URL from Convex
 * 2. Upload file directly to storage
 * 3. Create book record with file metadata
 */
export function uploadBookWithFile(
	userId: string,
	file: File,
	metadata: {
		title: string;
		author?: string;
		description?: string;
		coverUrl?: string;
		documentType?: 'book' | 'research_paper' | 'article' | 'notes' | 'other';
	}
): Effect.Effect<Book, AppError> {
	return Effect.gen(function* () {
		const generatedCoverUrl = yield* Effect.tryPromise({
			try: () => generateFirstPageThumbnail(file),
			catch: (error) => new DatabaseError('Failed to generate thumbnail', error)
		}).pipe(Effect.orElseSucceed(() => undefined));

		// Step 1: Get upload URL
		const uploadUrl = yield* Effect.tryPromise({
			try: () => convexClient.mutation(api.files.generateUploadUrl, {}),
			catch: (error) => new DatabaseError('Failed to generate upload URL', error)
		});

		// Step 2: Upload file directly to storage
		const uploadResponse = yield* Effect.tryPromise({
			try: async () => {
				const response = await fetch(uploadUrl, {
					method: 'POST',
					headers: { 'Content-Type': file.type || 'application/octet-stream' },
					body: file
				});
				if (!response.ok) {
					throw new Error(`Upload failed: ${response.status}`);
				}
				const result = await response.json();
				return result.storageId as Id<'_storage'>;
			},
			catch: (error) => new DatabaseError('Failed to upload file', error)
		});

		// Step 3: Create book record with file metadata
		const bookId = yield* Effect.tryPromise({
			try: () =>
				convexClient.mutation(api.books.createWithFile, {
					userId,
					title: metadata.title,
					author: metadata.author,
					description: metadata.description,
					coverUrl: generatedCoverUrl ?? metadata.coverUrl,
					documentType: metadata.documentType,
					fileStorageId: uploadResponse,
					fileName: file.name,
					fileType: file.type || 'application/octet-stream',
					fileSize: file.size
				}),
			catch: (error) => new DatabaseError('Failed to create book record', error)
		});

		// Step 4: Trigger text extraction (async, don't wait)
		effectIgnoreError(() =>
			convexClient.action(api.extraction.extractTextFromFile, {
				bookId,
				storageId: uploadResponse,
				fileType: file.type || 'application/octet-stream'
			})
		);

		return yield* fetchBookById(bookId, userId);
	});
}

// Helper to ignore errors in async operations
function effectIgnoreError<T>(fn: () => Promise<T>): void {
	fn().catch(() => {
		// Ignore errors
	});
}
