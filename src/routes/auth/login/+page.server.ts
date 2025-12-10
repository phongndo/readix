import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { loginSchema } from '$features/auth';

export const actions = {
  default: async (event) => {
    const formData = Object.fromEntries(await event.request.formData());
    
    // Validate
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return fail(400, { 
        errors: result.error.flatten().fieldErrors,
        email: formData.email as string
      });
    }
    
    // Authenticate
    const { email, password } = result.data;
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
    
    throw redirect(303, '/dashboard');
  }
} satisfies Actions;
