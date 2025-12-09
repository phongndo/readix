import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// Get the session from event.locals (set by hooks.server.ts)
	const session = event.locals.session;
	// If no session, redirect to login
	if (!session) {
		throw redirect(302, '/auth/login');
	}
	// If we get here, user is authenticated
	// You can return user data to the page
	return {
		session,
		user: session.user
	};
};
