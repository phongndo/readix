import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get all annotations for a book
 */
export const getAnnotations = query({
	args: {
		bookId: v.id('books'),
		userId: v.id('users')
	},
	handler: async (ctx, args) => {
		const annotations = await ctx.db
			.query('annotations')
			.withIndex('by_book_user', (q) => q.eq('bookId', args.bookId).eq('userId', args.userId))
			.collect();

		return annotations;
	}
});

/**
 * Create a new annotation (highlight or note)
 */
export const createAnnotation = mutation({
	args: {
		bookId: v.id('books'),
		userId: v.id('users'),
		type: v.union(v.literal('highlight'), v.literal('note')),
		page: v.number(),
		position: v.object({
			startOffset: v.number(),
			endOffset: v.number(),
			boundingBoxes: v.array(
				v.object({
					x: v.number(),
					y: v.number(),
					width: v.number(),
					height: v.number()
				})
			)
		}),
		highlightedText: v.string(),
		note: v.optional(v.string()),
		color: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	},
	handler: async (ctx, args) => {
		const annotationId = await ctx.db.insert('annotations', args);
		return annotationId;
	}
});

/**
 * Delete an annotation
 */
export const deleteAnnotation = mutation({
	args: {
		annotationId: v.id('annotations')
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.annotationId);
	}
});

/**
 * Update an annotation's note or color
 */
export const updateAnnotation = mutation({
	args: {
		annotationId: v.id('annotations'),
		updates: v.object({
			note: v.optional(v.string()),
			color: v.optional(v.string())
		})
	},
	handler: async (ctx, args) => {
		const updateData: { note?: string; color?: string; updatedAt: number } = {
			updatedAt: Date.now()
		};

		if (args.updates.note !== undefined) {
			updateData.note = args.updates.note;
		}

		if (args.updates.color !== undefined) {
			updateData.color = args.updates.color;
		}

		await ctx.db.patch(args.annotationId, updateData);
	}
});
