export const ACHIEVEMENT_DEFINITIONS = {
	FIRST_BOOK: {
		id: 'first-book',
		name: 'First Steps',
		description: 'Complete your first book',
		icon: 'book-open',
		condition: (stats: UserStats) => stats.completedBooks >= 1
	},
	SPEED_READER: {
		id: 'speed-reader',
		name: 'Speed Reader',
		description: 'Read 100 pages in a single day',
		icon: 'zap',
		condition: (stats: UserStats) => stats.maxPagesInDay >= 100
	},
	STREAK_MASTER: {
		id: 'streak-master',
		name: 'Streak Master',
		description: 'Maintain a 7-day reading streak',
		icon: 'flame',
		condition: (stats: UserStats) => stats.currentStreak >= 7
	},
	BOOK_WORM: {
		id: 'book-worm',
		name: 'Book Worm',
		description: 'Read 10 books',
		icon: 'glasses',
		condition: (stats: UserStats) => stats.completedBooks >= 10
	},
	MARATHON_READER: {
		id: 'marathon-reader',
		name: 'Marathon Reader',
		description: 'Read for 5 hours in one day',
		icon: 'clock',
		condition: (stats: UserStats) => stats.maxMinutesInDay >= 300
	},
	NIGHT_OWL: {
		id: 'night-owl',
		name: 'Night Owl',
		description: 'Read after midnight',
		icon: 'moon',
		condition: () => false
	}
} as const;

export type UserStats = {
	completedBooks: number;
	currentStreak: number;
	maxPagesInDay: number;
	maxMinutesInDay: number;
};

export type AchievementDefinition =
	(typeof ACHIEVEMENT_DEFINITIONS)[keyof typeof ACHIEVEMENT_DEFINITIONS];

export function checkAchievements(
	stats: UserStats,
	unlockedAchievements: Array<{ name: string }>
): AchievementDefinition[] {
	const unlockedIds = new Set(unlockedAchievements.map((a) => a.name));

	return Object.values(ACHIEVEMENT_DEFINITIONS).filter(
		(def) => !unlockedIds.has(def.name) && def.condition(stats)
	);
}
