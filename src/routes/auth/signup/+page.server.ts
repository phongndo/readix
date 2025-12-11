import { fail, redirect } from '@sveltejs/kit';
import { Either } from 'effect';
import type { Actions } from './$types';
import { decodeSignupInput } from '$features/auth';
import { formatSchemaErrors } from '$shared/lib/effect';
export const actions = {
	default: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());
		// Validate with Effect Schema
		const result = decodeSignupInput(formData);
		if (Either.isLeft(result)) {
			return fail(400, {
				errors: formatSchemaErrors(result.left),
				email: formData.email as string,
				firstname: formData.firstname as string,
				lastname: formData.lastname as string
			});
		}
		const { email, password, firstname, lastname } = result.right;
		const { error } = await event.locals.supabase.auth.signUp({
			email,
			password,
			options: {
				data: { firstName: firstname, lastName: lastname }
			}
		});
		if (error) {
			return fail(400, {
				errors: { form: [error.message] },
				email,
				firstname,
				lastname
			});
		}
		throw redirect(303, '/library');
	}
} satisfies Actions;
