import { buildClerkProps } from 'svelte-clerk/server';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

const getClerkPortalUrl = (redirectUrl: string) => {
	const baseUrl = 'https://immortal-locust-40.accounts.dev/sign-in';
	return `${baseUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`;
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
