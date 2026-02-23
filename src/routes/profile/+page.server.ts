import type { PageServerLoad } from './$types';
import { Effect } from 'effect';
import * as progressService from '$lib/services/progressService';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = locals.auth();
	const userId = auth.userId;

	if (!userId) {
		return {
			achievements: [],
			stats: {
				totalBooksRead: 0,
				totalPagesRead: 0,
				totalReadingTime: 0
			},
			streak: {
				current: 0,
				longest: 0
			}
		};
	}

	try {
		const [stats, streak, achievements] = await Promise.all([
			Effect.runPromise(progressService.fetchUserStats(userId)),
			Effect.runPromise(progressService.fetchUserStreak(userId)),
			Effect.runPromise(progressService.fetchUserAchievements(userId))
		]);

		return {
			achievements,
			stats: {
				totalBooksRead: stats.totalBooksRead,
				totalPagesRead: stats.totalPagesRead,
				totalReadingTime: stats.totalReadingTime
			},
			streak: {
				current: streak?.currentStreak ?? 0,
				longest: streak?.longestStreak ?? 0
			}
		};
	} catch (error) {
		console.error('Failed to load profile progress data:', error);
		return {
			achievements: [],
			stats: {
				totalBooksRead: 0,
				totalPagesRead: 0,
				totalReadingTime: 0
			},
			streak: {
				current: 0,
				longest: 0
			}
		};
	}
};
