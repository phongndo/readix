import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { signupSchema } from '$features/auth';
export const actions = {
	default: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());

		const result = signupSchema.safeParse(formData);
		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors,
				email: formData.email as string,
				firstname: formData.firstname as string,
				lastname: formData.lastname as string
			});
		}

		const { email, password, firstname, lastname } = result.data;
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

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
