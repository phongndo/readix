import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

export const getByUser = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user) return [];

		const books = await ctx.db
			.query('books')
			.withIndex('by_user_updated', (q) => q.eq('userId', user._id))
			.order('desc')
			.take(100);

		const readingPositions = await ctx.db
			.query('readingPositions')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();

		const positionsByBookId = new Map(
			readingPositions.map((position) => [position.bookId, position])
		);

		return books.map((book) => {
			const position = positionsByBookId.get(book._id);
			if (!position) {
				return book;
			}

			const normalizedTotalPages = Math.max(1, book.totalPages);
			const positionPage = Math.max(0, Math.min(position.page, normalizedTotalPages));
			const currentPage = Math.max(book.currentPage, positionPage);
			const isCompleted = currentPage >= normalizedTotalPages;

			if (currentPage === book.currentPage && isCompleted === book.isCompleted) {
				return book;
			}

			return {
				...book,
				currentPage,
				isCompleted
			};
		});
	}
});

export const getById = query({
	args: { bookId: v.id('books'), userId: v.string() },
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) return null;

		const user = await ctx.db.get(book.userId);
		if (!user || user.clerkId !== args.userId) {
			return null;
		}

		const readingPosition = await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', user._id))
			.first();

		if (!readingPosition) {
			return book;
		}

		const normalizedTotalPages = Math.max(1, book.totalPages);
		const positionPage = Math.max(0, Math.min(readingPosition.page, normalizedTotalPages));
		const currentPage = Math.max(book.currentPage, positionPage);
		const isCompleted = currentPage >= normalizedTotalPages;

		if (currentPage === book.currentPage && isCompleted === book.isCompleted) {
			return book;
		}

		return {
			...book,
			currentPage,
			isCompleted
		};
	}
});

export const create = mutation({
	args: {
		userId: v.string(),
		title: v.string(),
		author: v.optional(v.string()),
		description: v.optional(v.string()),
		coverUrl: v.optional(v.string()),
		totalPages: v.number(),
		content: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		let userId: Id<'users'>;

		if (!user) {
			userId = await ctx.db.insert('users', {
				clerkId: args.userId,
				email: '',
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		} else {
			userId = user._id;
		}

		const bookId = await ctx.db.insert('books', {
			userId,
			title: args.title,
			author: args.author || 'Unknown Author',
			description: args.description,
			coverUrl: args.coverUrl,
			totalPages: args.totalPages,
			currentPage: 0,
			content: args.content,
			isCompleted: false,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});

		return bookId;
	}
});

export const updateProgress = mutation({
	args: {
		bookId: v.id('books'),
		userId: v.string(),
		newPage: v.number()
	},
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) throw new Error('Book not found');

		const user = await ctx.db.get(book.userId);
		if (!user || user.clerkId !== args.userId) {
			throw new Error('Unauthorized');
		}

		if (args.newPage < 0 || args.newPage > book.totalPages) {
			throw new Error('Invalid page number');
		}

		const isCompleted = args.newPage >= book.totalPages;

		await ctx.db.patch(args.bookId, {
			currentPage: args.newPage,
			isCompleted,
			updatedAt: Date.now()
		});

		return { ...book, currentPage: args.newPage, isCompleted };
	}
});

export const syncTotalPages = mutation({
	args: {
		bookId: v.id('books'),
		userId: v.string(),
		totalPages: v.number()
	},
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) {
			throw new Error('Book not found');
		}

		const user = await ctx.db.get(book.userId);
		if (!user || user.clerkId !== args.userId) {
			throw new Error('Unauthorized');
		}

		const normalizedTotalPages = Math.max(1, Math.floor(args.totalPages));
		const currentPage = Math.max(0, Math.min(book.currentPage, normalizedTotalPages));
		const isCompleted = currentPage >= normalizedTotalPages;

		if (
			book.totalPages === normalizedTotalPages &&
			book.currentPage === currentPage &&
			book.isCompleted === isCompleted
		) {
			return book;
		}

		await ctx.db.patch(args.bookId, {
			totalPages: normalizedTotalPages,
			currentPage,
			isCompleted,
			updatedAt: Date.now()
		});

		return {
			...book,
			totalPages: normalizedTotalPages,
			currentPage,
			isCompleted
		};
	}
});

export const getDeletePreview = query({
	args: { bookId: v.id('books'), userId: v.string() },
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) return null;

		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user || user._id !== book.userId) {
			return null;
		}

		const [
			bookContentRows,
			documentTextRows,
			readingPositionRows,
			bookmarkRows,
			annotationRows,
			readingSessionRows
		] = await Promise.all([
			ctx.db
				.query('bookContent')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('documentText')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('readingPositions')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('bookmarks')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('annotations')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('readingSessions')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect()
		]);

		// Only include user-owned records for user-scoped tables.
		const readingPositions = readingPositionRows.filter((row) => row.userId === user._id);
		const bookmarks = bookmarkRows.filter((row) => row.userId === user._id);
		const annotations = annotationRows.filter((row) => row.userId === user._id);
		const readingSessions = readingSessionRows.filter((row) => row.userId === user._id);

		const counts = {
			bookContent: bookContentRows.length,
			documentText: documentTextRows.length,
			readingPositions: readingPositions.length,
			bookmarks: bookmarks.length,
			annotations: annotations.length,
			readingSessions: readingSessions.length,
			fileStorage: book.fileStorageId ? 1 : 0
		};

		return {
			bookId: args.bookId,
			title: book.title,
			fileName: book.fileName || null,
			hasStoredFile: book.fileStorageId != null,
			counts,
			totalRecords:
				counts.bookContent +
				counts.documentText +
				counts.readingPositions +
				counts.bookmarks +
				counts.annotations +
				counts.readingSessions +
				counts.fileStorage
		};
	}
});

export const remove = mutation({
	args: { bookId: v.id('books'), userId: v.string() },
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) return;

		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user || user._id !== book.userId) {
			throw new Error('Unauthorized');
		}

		const [
			bookContentRows,
			documentTextRows,
			readingPositionRows,
			bookmarkRows,
			annotationRows,
			readingSessionRows
		] = await Promise.all([
			ctx.db
				.query('bookContent')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('documentText')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('readingPositions')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('bookmarks')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('annotations')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect(),
			ctx.db
				.query('readingSessions')
				.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
				.collect()
		]);

		// Strictly delete only records owned by this user for user-scoped tables.
		const readingPositions = readingPositionRows.filter((row) => row.userId === user._id);
		const bookmarks = bookmarkRows.filter((row) => row.userId === user._id);
		const annotations = annotationRows.filter((row) => row.userId === user._id);
		const readingSessions = readingSessionRows.filter((row) => row.userId === user._id);

		for (const row of bookContentRows) {
			await ctx.db.delete(row._id);
		}
		for (const row of documentTextRows) {
			await ctx.db.delete(row._id);
		}
		for (const row of readingPositions) {
			await ctx.db.delete(row._id);
		}
		for (const row of bookmarks) {
			await ctx.db.delete(row._id);
		}
		for (const row of annotations) {
			await ctx.db.delete(row._id);
		}
		for (const row of readingSessions) {
			await ctx.db.delete(row._id);
		}

		await ctx.db.delete(args.bookId);

		// Recompute user stats from remaining sessions.
		const remainingSessions = await ctx.db
			.query('readingSessions')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.collect();
		const completedBooks = await ctx.db
			.query('books')
			.withIndex('by_completed', (q) => q.eq('userId', user._id).eq('isCompleted', true))
			.collect();
		const existingStats = await ctx.db
			.query('userStats')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.first();

		const totals = remainingSessions.reduce(
			(acc, session) => {
				const pagesRead = Math.max(0, session.endPage - session.startPage);
				return {
					totalPagesRead: acc.totalPagesRead + pagesRead,
					totalReadingTime: acc.totalReadingTime + session.durationMinutes
				};
			},
			{ totalPagesRead: 0, totalReadingTime: 0 }
		);

		const statsPatch = {
			totalBooksRead: completedBooks.length,
			totalPagesRead: totals.totalPagesRead,
			totalReadingTime: totals.totalReadingTime,
			updatedAt: Date.now()
		};

		if (existingStats) {
			await ctx.db.patch(existingStats._id, statsPatch);
		} else {
			await ctx.db.insert('userStats', {
				userId: user._id,
				...statsPatch
			});
		}

		// Delete associated file from storage if it exists.
		// Keep this after DB cleanup so user-visible data is already consistent
		// even if storage deletion fails transiently.
		if (book.fileStorageId) {
			try {
				await ctx.storage.delete(book.fileStorageId);
			} catch (error) {
				console.error('Failed to delete file from storage:', error);
			}
		}

		return {
			deleted: true,
			counts: {
				bookContent: bookContentRows.length,
				documentText: documentTextRows.length,
				readingPositions: readingPositions.length,
				bookmarks: bookmarks.length,
				annotations: annotations.length,
				readingSessions: readingSessions.length,
				fileStorage: book.fileStorageId ? 1 : 0
			}
		};
	}
});

/**
 * Create a book with an uploaded file.
 * This is called after the file has been uploaded to storage.
 */
export const createWithFile = mutation({
	args: {
		userId: v.string(),
		title: v.string(),
		author: v.optional(v.string()),
		description: v.optional(v.string()),
		coverUrl: v.optional(v.string()),
		documentType: v.optional(
			v.union(
				v.literal('book'),
				v.literal('research_paper'),
				v.literal('article'),
				v.literal('notes'),
				v.literal('other')
			)
		),
		fileStorageId: v.id('_storage'),
		fileName: v.string(),
		fileType: v.string(),
		fileSize: v.number(),
		totalPages: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		let userId: Id<'users'>;

		if (!user) {
			userId = await ctx.db.insert('users', {
				clerkId: args.userId,
				email: '',
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		} else {
			userId = user._id;
		}

		const bookId = await ctx.db.insert('books', {
			userId,
			title: args.title,
			author: args.author || 'Unknown Author',
			description: args.description,
			coverUrl: args.coverUrl,
			totalPages: Math.max(1, args.totalPages ?? 1),
			currentPage: 0,
			content: '', // Will be populated after text extraction
			fileStorageId: args.fileStorageId,
			fileName: args.fileName,
			fileType: args.fileType,
			fileSize: args.fileSize,
			documentType: args.documentType,
			isCompleted: false,
			createdAt: Date.now(),
			updatedAt: Date.now()
		});

		// Create initial book content record with pending status
		await ctx.db.insert('bookContent', {
			bookId,
			extractedText: '',
			extractionStatus: 'pending',
			extractedAt: Date.now()
		});

		return bookId;
	}
});

/**
 * Get book content with extracted text.
 */
export const getBookContent = query({
	args: { bookId: v.id('books'), userId: v.string() },
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) return null;

		const user = await ctx.db.get(book.userId);
		if (!user || user.clerkId !== args.userId) {
			return null;
		}

		return await ctx.db
			.query('bookContent')
			.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
			.first();
	}
});

/**
 * Get books by storage ID (for file serving)
 */
export const getByStorageId = query({
	args: {
		storageId: v.id('_storage')
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('books')
			.withIndex('by_storage_id', (q) => q.eq('fileStorageId', args.storageId))
			.take(1);
	}
});
