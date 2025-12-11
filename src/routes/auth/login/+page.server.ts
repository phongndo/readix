import { fail, redirect } from '@sveltejs/kit';
import { Either } from 'effect';
import type { Actions } from './$types';
import { decodeLoginInput } from '$features/auth';
import { formatSchemaErrors } from '$shared/lib/effect';
export const actions = {
	default: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		// Validate with Effect Schema
		const result = decodeLoginInput(formData);
		if (Either.isLeft(result)) {
			return fail(400, {
				errors: formatSchemaErrors(result.left),
				email: formData.email as string
			});
		}
		// Authenticate
		const { email, password } = result.right;
		const { error } = await event.locals.supabase.auth.signInWithPassword({
			email,
			password
		});
		if (error) {
			return fail(401, {
				errors: { form: [error.message] },
				email
			});
		}
		throw redirect(303, '/library');
	}
} satisfies Actions;
