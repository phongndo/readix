import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

function calculateStreakUpdate(
	currentStreak: number,
	longestStreak: number,
	lastReadAt: number | undefined,
	now: number
) {
	const hoursSinceLastRead = lastReadAt ? (now - lastReadAt) / (1000 * 60 * 60) : Infinity;

	if (hoursSinceLastRead > 48) {
		return {
			currentStreak: 1,
			longestStreak: Math.max(longestStreak, 1),
			lastReadAt: now
		};
	}

	if (hoursSinceLastRead >= 20) {
		const newStreak = currentStreak + 1;
		return {
			currentStreak: newStreak,
			longestStreak: Math.max(longestStreak, newStreak),
			lastReadAt: now
		};
	}

	return {
		currentStreak,
		longestStreak,
		lastReadAt: now
	};
}

export const recordSession = mutation({
	args: {
		userId: v.string(),
		bookId: v.id('books'),
		startPage: v.number(),
		endPage: v.number(),
		durationMinutes: v.number()
	},
	handler: async (ctx, args) => {
		const pagesRead = args.endPage - args.startPage;
		if (pagesRead <= 0) return;

		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user) throw new Error('User not found');

		await ctx.db.insert('readingSessions', {
			bookId: args.bookId,
			userId: user._id,
			startPage: args.startPage,
			endPage: args.endPage,
			durationMinutes: args.durationMinutes,
			createdAt: Date.now()
		});

		const stats = await ctx.db
			.query('userStats')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.first();

		if (stats) {
			await ctx.db.patch(stats._id, {
				totalPagesRead: stats.totalPagesRead + pagesRead,
				totalReadingTime: stats.totalReadingTime + args.durationMinutes,
				updatedAt: Date.now()
			});
		} else {
			await ctx.db.insert('userStats', {
				userId: user._id,
				totalBooksRead: 0,
				totalPagesRead: pagesRead,
				totalReadingTime: args.durationMinutes,
				updatedAt: Date.now()
			});
		}

		const streak = await ctx.db
			.query('streaks')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.first();

		const now = Date.now();
		if (streak) {
			const update = calculateStreakUpdate(
				streak.currentStreak,
				streak.longestStreak,
				streak.lastReadAt,
				now
			);
			await ctx.db.patch(streak._id, {
				...update,
				updatedAt: now
			});
		} else {
			await ctx.db.insert('streaks', {
				userId: user._id,
				currentStreak: 1,
				longestStreak: 1,
				lastReadAt: now,
				updatedAt: now
			});
		}

		await checkAndAwardAchievementsInternal(ctx, user._id);
	}
});

/* eslint-disable @typescript-eslint/no-explicit-any */
async function checkAndAwardAchievementsInternal(ctx: any, userId: any) {
	const [streak, completedBooks, todaySessions, existingAchievements] = await Promise.all([
		ctx.db
			.query('streaks')
			.withIndex('by_user', (q: any) => q.eq('userId', userId))
			.first(),
		ctx.db
			.query('books')
			.withIndex('by_completed', (q: any) => q.eq('userId', userId).eq('isCompleted', true))
			.collect(),
		ctx.db
			.query('readingSessions')
			.withIndex('by_user_created', (q: any) => q.eq('userId', userId))
			.filter((s: any) => s.createdAt > Date.now() - 24 * 60 * 60 * 1000)
			.collect(),
		ctx.db
			.query('achievements')
			.withIndex('by_user', (q: any) => q.eq('userId', userId))
			.collect()
	]);

	const unlockedNames = new Set(existingAchievements.map((a: any) => a.name));

	const pagesToday = todaySessions.reduce(
		(sum: number, s: any) => sum + (s.endPage - s.startPage),
		0
	);
	const minutesToday = todaySessions.reduce((sum: number, s: any) => sum + s.durationMinutes, 0);

	const achievementsToAward = [];

	if (completedBooks.length >= 1 && !unlockedNames.has('First Steps')) {
		achievementsToAward.push({
			name: 'First Steps',
			description: 'Complete your first book',
			icon: 'book-open'
		});
	}

	if (pagesToday >= 100 && !unlockedNames.has('Speed Reader')) {
		achievementsToAward.push({
			name: 'Speed Reader',
			description: 'Read 100 pages in a single day',
			icon: 'zap'
		});
	}

	if ((streak?.currentStreak ?? 0) >= 7 && !unlockedNames.has('Streak Master')) {
		achievementsToAward.push({
			name: 'Streak Master',
			description: 'Maintain a 7-day reading streak',
			icon: 'flame'
		});
	}

	if (completedBooks.length >= 10 && !unlockedNames.has('Book Worm')) {
		achievementsToAward.push({
			name: 'Book Worm',
			description: 'Read 10 books',
			icon: 'glasses'
		});
	}

	if (minutesToday >= 300 && !unlockedNames.has('Marathon Reader')) {
		achievementsToAward.push({
			name: 'Marathon Reader',
			description: 'Read for 5 hours in one day',
			icon: 'clock'
		});
	}

	for (const achievement of achievementsToAward) {
		await ctx.db.insert('achievements', {
			userId,
			name: achievement.name,
			description: achievement.description,
			icon: achievement.icon,
			unlockedAt: Date.now()
		});
	}

	return achievementsToAward.map((a: any) => a.name);
}

export const getStreak = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user) return null;

		return await ctx.db
			.query('streaks')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.first();
	}
});

export const getAchievements = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user) return [];

		return await ctx.db
			.query('achievements')
			.withIndex('by_user_unlocked', (q) => q.eq('userId', user._id))
			.order('desc')
			.take(50);
	}
});

export const getStats = query({
	args: { userId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.userId))
			.first();

		if (!user) return null;

		return await ctx.db
			.query('userStats')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.first();
	}
});
