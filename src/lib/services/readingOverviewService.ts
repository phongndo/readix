import { Effect } from 'effect';
import { fetchBooksByUser } from '$lib/services/bookService';
import {
	fetchActivityByDateRange,
	fetchUserAchievements,
	fetchUserStats,
	fetchUserStreak
} from '$lib/services/progressService';
import type { Book } from '$lib/domain/book/Book';
import type { DailyActivity } from '$lib/services/progressService';

type ReadingStats = {
	totalBooksRead: number;
	totalPagesRead: number;
	totalReadingTime: number;
};

type ReadingStreak = {
	current: number;
	longest: number;
};

type AchievementSummary = Array<{
	name: string;
	description: string;
	icon: string;
	unlockedAt: Date;
}>;

export type DashboardOverview = {
	books: Book[];
	stats: ReadingStats;
	streak: ReadingStreak;
	achievements: AchievementSummary;
	activity: DailyActivity[];
};

export type ProfileOverview = {
	achievements: AchievementSummary;
	stats: ReadingStats;
	streak: ReadingStreak;
};

export type WorkspaceOverview = {
	books: Book[];
};

const emptyStats = (): ReadingStats => ({
	totalBooksRead: 0,
	totalPagesRead: 0,
	totalReadingTime: 0
});

const emptyStreak = (): ReadingStreak => ({
	current: 0,
	longest: 0
});

export async function loadDashboardOverview(userId?: string | null): Promise<DashboardOverview> {
	if (!userId) {
		return {
			books: [],
			stats: emptyStats(),
			streak: emptyStreak(),
			achievements: [],
			activity: []
		};
	}

	try {
		const [books, stats, streak, achievements, activity] = await Promise.all([
			Effect.runPromise(fetchBooksByUser(userId)),
			Effect.runPromise(fetchUserStats(userId)),
			Effect.runPromise(fetchUserStreak(userId)),
			Effect.runPromise(fetchUserAchievements(userId)),
			Effect.runPromise(fetchActivityByDateRange(userId, 365))
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
			stats: emptyStats(),
			streak: emptyStreak(),
			achievements: [],
			activity: []
		};
	}
}

export async function loadProfileOverview(userId?: string | null): Promise<ProfileOverview> {
	if (!userId) {
		return {
			achievements: [],
			stats: emptyStats(),
			streak: emptyStreak()
		};
	}

	try {
		const [stats, streak, achievements] = await Promise.all([
			Effect.runPromise(fetchUserStats(userId)),
			Effect.runPromise(fetchUserStreak(userId)),
			Effect.runPromise(fetchUserAchievements(userId))
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
			stats: emptyStats(),
			streak: emptyStreak()
		};
	}
}

export async function loadWorkspaceOverview(userId: string): Promise<WorkspaceOverview> {
	return {
		books: await Effect.runPromise(fetchBooksByUser(userId))
	};
}
