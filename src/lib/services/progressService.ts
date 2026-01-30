import { Effect, Option, Schema } from 'effect';
import { DatabaseError, type AppError } from '$lib/effect/errors';
import { type Streak } from '$lib/domain/gamification/Achievement';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';
import { UserId } from '$lib/domain/book/Book';

// Create branded StreakId using Effect Schema (same pattern as Achievement.ts)
const StreakId = Schema.String.pipe(Schema.brand('StreakId'));

export function recordReadingSession(
	userId: string,
	bookId: string,
	startPage: number,
	endPage: number,
	durationMinutes: number
): Effect.Effect<void, AppError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.progress.recordSession, {
				userId,
				bookId: bookId as Id<'books'>,
				startPage,
				endPage,
				durationMinutes
			}),
		catch: (error) => new DatabaseError('Failed to record reading session', error)
	}).pipe(Effect.map(() => undefined));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function checkAndAwardAchievements(_userId: string): Effect.Effect<string[], AppError> {
	return Effect.succeed([]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAchievement(a: any) {
	return {
		name: a.name,
		description: a.description,
		icon: a.icon ?? 'award',
		unlockedAt: new Date(a.unlockedAt)
	};
}

export function fetchUserAchievements(
	userId: string
): Effect.Effect<
	Array<{ name: string; description: string; icon: string; unlockedAt: Date }>,
	AppError
> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.progress.getAchievements, { userId }),
		catch: (error) => new DatabaseError('Failed to fetch achievements', error)
	}).pipe(Effect.map((docs) => docs.map(mapAchievement)));
}

export function fetchUserStreak(userId: string): Effect.Effect<Streak | null, AppError> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.progress.getStreak, { userId }),
		catch: (error) => new DatabaseError('Failed to fetch streak', error)
	}).pipe(
		Effect.map((doc) =>
			doc
				? {
						id: StreakId.make(doc._id),
						userId: UserId.make(doc.userId),
						currentStreak: doc.currentStreak,
						longestStreak: doc.longestStreak,
						lastReadAt: doc.lastReadAt ? Option.some(new Date(doc.lastReadAt)) : Option.none(),
						updatedAt: new Date(doc.updatedAt)
					}
				: null
		)
	);
}

export interface UserStats {
	totalBooksRead: number;
	totalPagesRead: number;
	totalReadingTime: number;
}

export function fetchUserStats(userId: string): Effect.Effect<UserStats, AppError> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.progress.getStats, { userId }),
		catch: (error) => new DatabaseError('Failed to fetch user stats', error)
	}).pipe(
		Effect.map((doc) =>
			doc
				? {
						totalBooksRead: doc.totalBooksRead ?? 0,
						totalPagesRead: doc.totalPagesRead ?? 0,
						totalReadingTime: doc.totalReadingTime ?? 0
					}
				: { totalBooksRead: 0, totalPagesRead: 0, totalReadingTime: 0 }
		)
	);
}

export interface DailyActivity {
	date: Date;
	pages: number;
}

export function fetchActivityByDateRange(
	userId: string,
	days: number
): Effect.Effect<DailyActivity[], AppError> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.progress.getActivityByDateRange, { userId, days }),
		catch: (error) => new DatabaseError('Failed to fetch activity data', error)
	}).pipe(
		Effect.map((docs) =>
			docs.map((doc: { date: number; pages: number }) => ({
				date: new Date(doc.date),
				pages: doc.pages
			}))
		)
	);
}
