export const APP_CONFIG = {
	name: 'Readix',
	version: '0.0.1',
	description: 'Reading platform with Duolingo-style gamification'
} as const;

export const READING_CONFIG = {
	minReadingTimeMinutes: 5,
	streakGraceHours: 24,
	pagesPerLevel: 100
} as const;

export const ACHIEVEMENTS = {
	FIRST_BOOK: {
		name: 'First Steps',
		description: 'Complete your first book',
		icon: 'book-open'
	},
	SPEED_READER: {
		name: 'Speed Reader',
		description: 'Read 100 pages in a single day',
		icon: 'zap'
	},
	STREAK_MASTER: {
		name: 'Streak Master',
		description: 'Maintain a 7-day reading streak',
		icon: 'flame'
	},
	BOOK_WORM: {
		name: 'Book Worm',
		description: 'Read 10 books',
		icon: 'glasses'
	}
} as const;
