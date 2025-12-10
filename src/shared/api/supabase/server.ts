import { env } from '$shared/config';
import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { createCookieHandler } from './cookies';
import type { Database } from '$shared/types';
/**
 * Creates a server-side Supabase client with cookie-based session management.
 * Use this in server actions and load functions to access Supabase auth securely.
 * @param event - SvelteKit RequestEvent
 * @returns SupabaseClient with automatic cookie handling
 */
export const getSupabaseServer = (event: RequestEvent) => {
	return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, {
		cookies: createCookieHandler(event)
	});
};
