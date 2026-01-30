import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

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
		author: v.string(),
		description: v.optional(v.string()),
		coverUrl: v.optional(v.string()),
		totalPages: v.number(),
		content: v.string()
	},
	handler: async (ctx, args) => {
		let user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user) {
			user = await ctx.db.insert('users', {
				clerkId: args.userId,
				email: '',
				createdAt: Date.now(),
				updatedAt: Date.now()
			});
		}

		const bookId = await ctx.db.insert('books', {
			userId: user._id,
			title: args.title,
			author: args.author,
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

		await ctx.db.delete(args.bookId);
	}
});
