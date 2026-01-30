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
		author: v.string(),
		description: v.optional(v.string()),
		coverUrl: v.optional(v.string()),
		totalPages: v.number(),
		currentPage: v.number(),
		content: v.string(),
		isCompleted: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_user_updated', ['userId', 'updatedAt'])
		.index('by_completed', ['userId', 'isCompleted']),

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
	}).index('by_user', ['userId'])
});
