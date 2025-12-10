import { env } from '$shared/config';
import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { createCookieHandler } from './cookies';

export const getSupabaseServer = (event: RequestEvent) => {
	return createServerClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
		cookies: createCookieHandler(event)
	});
};
