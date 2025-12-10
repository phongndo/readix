import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// Get the user from event.locals (set by hooks.server.ts)
	const user = event.locals.user;
	// If no user, redirect to login
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	// If we get here, user is authenticated
	// You can return user data to the page
	return {
		user: user
	};
};
