import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get saved reading position for a book
 */
export const getPosition = query({
	args: {
		bookId: v.id('books'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book || book.userId !== args.userId) {
			return null;
		}

		return await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', args.userId))
			.first();
	}
});

/**
 * Save or update reading position
 */
export const savePosition = mutation({
	args: {
		position: v.object({
			bookId: v.id('books'),
			userId: v.id('users'),
			format: v.union(v.literal('pdf'), v.literal('epub'), v.literal('text')),
			page: v.number(),
			scrollOffset: v.number(),
			timestamp: v.number()
		})
	},
	handler: async (ctx, args) => {
		const { bookId, userId } = args.position;
		const book = await ctx.db.get(bookId);
		if (!book) {
			throw new Error('Book not found');
		}
		if (book.userId !== userId) {
			throw new Error('Unauthorized');
		}

		const existing = await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', bookId).eq('userId', userId))
			.first();

		const normalizedTotalPages = Math.max(1, Math.floor(book.totalPages || 1));
		const normalizedPage = Math.max(
			0,
			Math.min(Math.floor(args.position.page), normalizedTotalPages)
		);
		const isCompleted = normalizedPage >= normalizedTotalPages;

		if (book.currentPage !== normalizedPage || book.isCompleted !== isCompleted) {
			await ctx.db.patch(bookId, {
				currentPage: normalizedPage,
				isCompleted,
				updatedAt: Date.now()
			});
		}

		if (existing) {
			await ctx.db.patch(existing._id, {
				page: normalizedPage,
				scrollOffset: args.position.scrollOffset,
				timestamp: args.position.timestamp
			});
			return existing._id;
		}

		return await ctx.db.insert('readingPositions', {
			...args.position,
			page: normalizedPage
		});
	}
});

/**
 * Delete reading position
 */
export const deletePosition = mutation({
	args: {
		bookId: v.id('books'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const book = await ctx.db.get(args.bookId);
		if (!book || book.userId !== args.userId) {
			throw new Error('Unauthorized');
		}

		const position = await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', args.userId))
			.first();

		if (position) {
			await ctx.db.delete(position._id);
		}
	}
});
