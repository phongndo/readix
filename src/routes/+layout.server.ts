import { buildClerkProps } from 'svelte-clerk/server';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';

const getClerkPortalUrl = (redirectUrl: string) => {
	const baseUrl = env.PUBLIC_CLERK_SIGN_IN_URL;
	if (!baseUrl) {
		error(500, 'PUBLIC_CLERK_SIGN_IN_URL is not configured');
	}
	const signInUrl = new URL(baseUrl);
	signInUrl.searchParams.set('redirect_url', redirectUrl);
	return signInUrl.toString();
};

export const load: LayoutServerLoad = ({ locals, url }) => {
	const auth = locals.auth();
	const userId = auth.userId;

	// List of public routes that don't require auth
	const publicRoutes = ['/sign-up', '/sso-callback'];
	const isPublicRoute = publicRoutes.some((route) => url.pathname.startsWith(route));

	// If not authenticated and not on a public route, redirect to Clerk portal
	if (!userId && !isPublicRoute) {
		const appUrl = `${url.protocol}//${url.host}${url.pathname}${url.search}`;
		throw redirect(307, getClerkPortalUrl(appUrl));
	}

	return {
		...buildClerkProps(auth),
		userId
	};
};
