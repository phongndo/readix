import type { Handle } from '@sveltejs/kit';
import { getSupabaseServer } from '$shared/api/supabase';
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = getSupabaseServer(event);
	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}
		return { session, user };
	};
	const { session } = await event.locals.safeGetSession();
	event.locals.session = session;
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
