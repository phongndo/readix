import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
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
};
