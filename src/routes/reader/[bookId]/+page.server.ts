import { error } from '@sveltejs/kit';
import { fetchBookById } from '$lib/services/bookService';
import { AppRuntime } from '$lib/effect/runtime';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const auth = locals.auth();
	const userId = auth.userId;

	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const bookId = params.bookId;

	try {
		const book = await AppRuntime(fetchBookById(bookId, userId));
		return { book };
	} catch (e) {
		console.error('Failed to load book:', e);
		throw error(404, 'Book not found');
	}
};
