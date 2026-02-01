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
		const position = await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', args.userId))
			.first();

		return position;
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

		// Check if position already exists
		const existing = await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', bookId).eq('userId', userId))
			.first();

		if (existing) {
			// Update existing
			await ctx.db.patch(existing._id, {
				page: args.position.page,
				scrollOffset: args.position.scrollOffset,
				timestamp: args.position.timestamp
			});
			return existing._id;
		} else {
			// Create new
			return await ctx.db.insert('readingPositions', args.position);
		}
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
		const position = await ctx.db
			.query('readingPositions')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', args.userId))
			.first();

		if (position) {
			await ctx.db.delete(position._id);
		}
	}
});
