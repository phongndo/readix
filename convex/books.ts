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

		return await ctx.db
			.query('books')
			.withIndex('by_user_updated', (q) => q.eq('userId', user._id))
			.order('desc')
			.take(100);
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

		return book;
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

export const remove = mutation({
	args: { bookId: v.id('books'), userId: v.string() },
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book) return;

		const user = await ctx.db.get(book.userId);
		if (!user || user.clerkId !== args.userId) {
			throw new Error('Unauthorized');
		}

		// Delete associated file from storage if exists
		if (book.fileStorageId) {
			try {
				await ctx.storage.delete(book.fileStorageId);
			} catch (error) {
				console.error('Failed to delete file from storage:', error);
				// Continue with book deletion even if file deletion fails
			}
		}

		// Delete associated book content if exists
		const bookContent = await ctx.db
			.query('bookContent')
			.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
			.first();
		if (bookContent) {
			await ctx.db.delete(bookContent._id);
		}

		await ctx.db.delete(args.bookId);
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
		fileSize: v.number()
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
			totalPages: 0, // Will be updated after text extraction
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
