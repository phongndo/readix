import { Effect, Option } from 'effect';
import { DatabaseError, type AppError } from '$lib/effect/errors';
import { type Streak } from '$lib/domain/gamification/Achievement';
import { convexClient } from '$lib/convex/client';
import { api } from '$lib/convex/api';

export function recordReadingSession(
	userId: string,
	bookId: number,
	startPage: number,
	endPage: number,
	durationMinutes: number
): Effect.Effect<void, AppError> {
	return Effect.tryPromise({
		try: () =>
			convexClient.mutation(api.progress.recordSession, {
				userId,
				bookId,
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
						id: doc._id,
						userId: doc.userId,
						currentStreak: doc.currentStreak,
						longestStreak: doc.longestStreak,
						lastReadAt: doc.lastReadAt ? Option.some(new Date(doc.lastReadAt)) : Option.none(),
						updatedAt: new Date(doc.updatedAt)
					}
				: null
		)
	);
}
