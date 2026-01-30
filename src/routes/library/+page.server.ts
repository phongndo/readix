import { error } from '@sveltejs/kit';
import { fetchBooksByUser } from '$lib/services/bookService';
import { fetchUserStreak, fetchUserAchievements } from '$lib/services/progressService';
import { AppRuntime } from '$lib/server/effect/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = locals.auth();
	const userId = auth.userId;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const [books, streak, achievements] = await Promise.all([
		AppRuntime(fetchBooksByUser(userId)),
		AppRuntime(fetchUserStreak(userId)),
		AppRuntime(fetchUserAchievements(userId))
	]);

	return {
		books,
		streak: {
			current: streak?.currentStreak ?? 0,
			longest: streak?.longestStreak ?? 0
		},
		achievements
	};
};
