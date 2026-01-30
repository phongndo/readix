import { error } from '@sveltejs/kit';
import { fetchBooksByUser } from '$lib/services/bookService';
import { AppRuntime } from '$lib/effect/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = locals.auth();
	const userId = auth.userId;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const books = await AppRuntime(fetchBooksByUser(userId));

	return {
		books
	};
};
