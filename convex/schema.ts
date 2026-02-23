import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		clerkId: v.string(),
		email: v.string(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_clerk_id', ['clerkId'])
		.index('by_email', ['email']),

	books: defineTable({
		userId: v.id('users'),
		title: v.string(),
		author: v.optional(v.string()),
		description: v.optional(v.string()),
		coverUrl: v.optional(v.string()),
		totalPages: v.number(),
		currentPage: v.number(),

		// File storage fields
		fileStorageId: v.optional(v.id('_storage')),
		fileName: v.optional(v.string()),
		fileType: v.optional(v.string()),
		fileSize: v.optional(v.number()),

		// Content now optional (loaded from file)
		content: v.optional(v.string()),

		// Document type classification
		documentType: v.optional(
			v.union(
				v.literal('book'),
				v.literal('research_paper'),
				v.literal('article'),
				v.literal('notes'),
				v.literal('other')
			)
		),

		isCompleted: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_user_updated', ['userId', 'updatedAt'])
		.index('by_completed', ['userId', 'isCompleted'])
		.index('by_user_document_type', ['userId', 'documentType'])
		.index('by_storage_id', ['fileStorageId']),

	readingSessions: defineTable({
		bookId: v.id('books'),
		userId: v.id('users'),
		startPage: v.number(),
		endPage: v.number(),
		durationMinutes: v.number(),
		createdAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_book', ['bookId'])
		.index('by_user_created', ['userId', 'createdAt'])
		.index('by_user_book', ['userId', 'bookId']),

	achievements: defineTable({
		userId: v.id('users'),
		name: v.string(),
		description: v.string(),
		icon: v.optional(v.string()),
		unlockedAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_user_unlocked', ['userId', 'unlockedAt'])
		.index('by_user_name', ['userId', 'name']),

	streaks: defineTable({
		userId: v.id('users'),
		currentStreak: v.number(),
		longestStreak: v.number(),
		lastReadAt: v.optional(v.number()),
		updatedAt: v.number()
	}).index('by_user', ['userId']),

	userStats: defineTable({
		userId: v.id('users'),
		totalBooksRead: v.number(),
		totalPagesRead: v.number(),
		totalReadingTime: v.number(),
		updatedAt: v.number()
	}).index('by_user', ['userId']),

	// Book content for extracted text and search indexing
	bookContent: defineTable({
		bookId: v.id('books'),
		extractedText: v.string(),
		extractionStatus: v.union(
			v.literal('pending'),
			v.literal('processing'),
			v.literal('completed'),
			v.literal('failed')
		),
		extractionError: v.optional(v.string()),
		extractedAt: v.number()
	})
		.index('by_book', ['bookId'])
		.index('by_status', ['extractionStatus']),

	// PDF/Document reading positions
	readingPositions: defineTable({
		bookId: v.id('books'),
		userId: v.id('users'),
		format: v.union(v.literal('pdf'), v.literal('epub'), v.literal('text')),
		page: v.number(),
		scrollOffset: v.number(),
		timestamp: v.number()
	})
		.index('by_book', ['bookId'])
		.index('by_book_user', ['bookId', 'userId'])
		.index('by_user', ['userId']),

	// Bookmarks for quick navigation
	bookmarks: defineTable({
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
	})
		.index('by_book', ['bookId'])
		.index('by_book_user', ['bookId', 'userId'])
		.index('by_book_page', ['bookId', 'page']),

	// Annotations (highlights and notes)
	annotations: defineTable({
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
	})
		.index('by_book', ['bookId'])
		.index('by_book_user', ['bookId', 'userId'])
		.index('by_book_page', ['bookId', 'page']),

	// Extracted text for search
	documentText: defineTable({
		bookId: v.id('books'),
		page: v.number(),
		text: v.string(),
		wordCount: v.number(),
		createdAt: v.number()
	})
		.index('by_book', ['bookId'])
		.index('by_book_page', ['bookId', 'page'])
		.searchIndex('search_text', {
			searchField: 'text'
		})
});
