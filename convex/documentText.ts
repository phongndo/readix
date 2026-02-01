import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Save or update page text (upsert operation)
 */
export const savePageText = mutation({
	args: {
		bookId: v.id('books'),
		page: v.number(),
		text: v.string(),
		wordCount: v.number(),
		createdAt: v.number()
	},
	handler: async (ctx, args) => {
		// Check if page already exists
		const existing = await ctx.db
			.query('documentText')
			.withIndex('by_book_page', (q) => q.eq('bookId', args.bookId).eq('page', args.page))
			.first();

		if (existing) {
			// Update existing
			await ctx.db.patch(existing._id, {
				text: args.text,
				wordCount: args.wordCount,
				createdAt: args.createdAt
			});
			return existing._id;
		} else {
			// Create new
			return await ctx.db.insert('documentText', args);
		}
	}
});

/**
 * Get text for a specific page
 */
export const getPageText = query({
	args: {
		bookId: v.id('books'),
		page: v.number()
	},
	handler: async (ctx, args) => {
		const pageText = await ctx.db
			.query('documentText')
			.withIndex('by_book_page', (q) => q.eq('bookId', args.bookId).eq('page', args.page))
			.first();

		return pageText;
	}
});

/**
 * Search document text using full-text search
 */
export const searchDocument = query({
	args: {
		bookId: v.id('books'),
		query: v.string()
	},
	handler: async (ctx, args) => {
		// Use searchIndex for full-text search, filter by bookId
		const searchResults = await ctx.db
			.query('documentText')
			.withSearchIndex('search_text', (q) => q.search('text', args.query))
			.take(50);

		// Filter by bookId client-side
		const results = searchResults.filter((doc) => doc.bookId === args.bookId);

		return results;
	}
});

/**
 * Delete all document text for a book
 */
export const deleteDocumentText = mutation({
	args: {
		bookId: v.id('books')
	},
	handler: async (ctx, args) => {
		const pages = await ctx.db
			.query('documentText')
			.withIndex('by_book', (q) => q.eq('bookId', args.bookId))
			.collect();

		for (const page of pages) {
			await ctx.db.delete(page._id);
		}
	}
});
