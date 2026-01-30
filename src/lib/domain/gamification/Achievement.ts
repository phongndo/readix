import { Schema, Option } from 'effect';
import { UserId } from '../book/Book';

export const AchievementId = Schema.String.pipe(Schema.brand('AchievementId'));
export type AchievementId = typeof AchievementId.Type;

export const AchievementSchema = Schema.Struct({
	id: AchievementId,
	userId: UserId,
	name: Schema.String,
	description: Schema.String,
	icon: Schema.optionalWith(Schema.String, { default: () => 'award' }),
	unlockedAt: Schema.DateFromNumber
});

export type Achievement = typeof AchievementSchema.Type;

export const StreakSchema = Schema.Struct({
	id: Schema.String.pipe(Schema.brand('StreakId')),
	userId: UserId,
	currentStreak: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	longestStreak: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
	lastReadAt: Schema.optionalWith(Schema.DateFromNumber, { as: 'Option' }),
	updatedAt: Schema.DateFromNumber
});

export type Streak = typeof StreakSchema.Type;

export function shouldUpdateStreak(streak: Streak, now: Date = new Date()): boolean {
	if (Option.isNone(streak.lastReadAt)) {
		return true;
	}

	const lastRead = streak.lastReadAt.value;
	const hoursSinceLastRead = (now.getTime() - lastRead.getTime()) / (1000 * 60 * 60);

	return hoursSinceLastRead >= 20 && hoursSinceLastRead <= 48;
}

export function isStreakBroken(streak: Streak, now: Date = new Date()): boolean {
	if (Option.isNone(streak.lastReadAt)) {
		return false;
	}

	const lastRead = streak.lastReadAt.value;
	const hoursSinceLastRead = (now.getTime() - lastRead.getTime()) / (1000 * 60 * 60);

	return hoursSinceLastRead > 48;
}

export function updateStreak(streak: Streak, now: Date = new Date()): Streak {
	if (isStreakBroken(streak, now)) {
		return {
			...streak,
			currentStreak: 1,
			lastReadAt: Option.some(now),
			updatedAt: now
		};
	}

	if (shouldUpdateStreak(streak, now)) {
		return {
			...streak,
			currentStreak: streak.currentStreak + 1,
			longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
			lastReadAt: Option.some(now),
			updatedAt: now
		};
	}

	return {
		...streak,
		lastReadAt: Option.some(now),
		updatedAt: now
	};
}
