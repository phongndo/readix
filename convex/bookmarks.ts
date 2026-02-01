import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get all bookmarks for a book
 */
export const getBookmarks = query({
	args: {
		bookId: v.id('books'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const bookmarks = await ctx.db
			.query('bookmarks')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', args.userId))
			.collect();

		return bookmarks;
	}
});

/**
 * Create a new bookmark
 */
export const createBookmark = mutation({
	args: {
		bookId: v.id('books'),
		userId: v.id('users'),
		page: v.number(),
		title: v.string(),
		color: v.optional(
			v.union(
				v.literal('yellow'),
				v.literal('green'),
				v.literal('blue'),
				v.literal('pink'),
				v.literal('purple')
			)
		),
		createdAt: v.number()
	},
	handler: async (ctx, args) => {
		const bookmarkId = await ctx.db.insert('bookmarks', args);
		return bookmarkId;
	}
});

/**
 * Delete a bookmark
 */
export const deleteBookmark = mutation({
	args: {
		bookmarkId: v.id('bookmarks')
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.bookmarkId);
	}
});

/**
 * Update a bookmark's title or color
 */
export const updateBookmark = mutation({
	args: {
		bookmarkId: v.id('bookmarks'),
		updates: v.object({
			title: v.optional(v.string()),
			color: v.optional(
				v.union(
					v.literal('yellow'),
					v.literal('green'),
					v.literal('blue'),
					v.literal('pink'),
					v.literal('purple')
				)
			)
		})
	},
	handler: async (ctx, args) => {
		const updateData: {
			title?: string;
			color?: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
		} = {};

		if (args.updates.title !== undefined) {
			updateData.title = args.updates.title;
		}

		if (args.updates.color !== undefined) {
			updateData.color = args.updates.color;
		}

		await ctx.db.patch(args.bookmarkId, updateData);
	}
});
