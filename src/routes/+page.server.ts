import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// For now, return empty data - will be populated from Convex
	// This matches the structure expected by the dashboard
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
		achievements: []
	};
};
