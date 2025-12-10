import type { Handle } from '@sveltejs/kit';
import { getSupabaseServer } from '$shared/api/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = getSupabaseServer(event);
	const {
		data: { user },
		error
	} = await event.locals.supabase.auth.getUser();
	event.locals.user = error ? null : user;

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
