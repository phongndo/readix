import type { PageServerLoad } from './$types';
import { Effect } from 'effect';
import * as bookService from '$lib/services/bookService';
import * as progressService from '$lib/services/progressService';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = locals.auth();
	const userId = auth.userId;

	if (!userId) {
		return {
			books: [],
			stats: {
				totalBooksRead: 0,
				totalPagesRead: 0,
				totalReadingTime: 0
			},
			streak: {
				current: 0,
				longest: 0
			},
			achievements: [],
			activity: []
		};
	}

	try {
		const [books, stats, streak, achievements, activity] = await Promise.all([
			Effect.runPromise(bookService.fetchBooksByUser(userId)),
			Effect.runPromise(progressService.fetchUserStats(userId)),
			Effect.runPromise(progressService.fetchUserStreak(userId)),
			Effect.runPromise(progressService.fetchUserAchievements(userId)),
			Effect.runPromise(progressService.fetchActivityByDateRange(userId, 365))
		]);

		return {
			books,
			stats: {
				totalBooksRead: stats.totalBooksRead,
				totalPagesRead: stats.totalPagesRead,
				totalReadingTime: stats.totalReadingTime
			},
			streak: {
				current: streak?.currentStreak ?? 0,
				longest: streak?.longestStreak ?? 0
			},
			achievements,
			activity
		};
	} catch (error) {
		console.error('Failed to load dashboard data:', error);
		return {
			books: [],
			stats: {
				totalBooksRead: 0,
				totalPagesRead: 0,
				totalReadingTime: 0
			},
			streak: {
				current: 0,
				longest: 0
			},
			achievements: [],
			activity: []
		};
	}
};
