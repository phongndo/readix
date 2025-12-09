import type { RequestEvent } from '@sveltejs/kit';
/**
 * Creates a cookie handler object for Supabase SSR.
 * Handles reading and writing session cookies securely.
 * @param event - SvelteKit RequestEvent with cookie access
 * @returns Cookie handler with getAll and setAll methods
 */
export const createCookieHandler = (event: RequestEvent) => ({
  getAll: () => event.cookies.getAll(),
  setAll: (cookiesToSet: any[]) => {
    /**
     * Note: You have to add the `path` variable to the set method
     * due to sveltekit's cookie API requiring this to be set.
     * Setting path to '/' replicates standard behavior.
     * https://kit.svelte.dev/docs/types#public-types-cookies
     */
    cookiesToSet.forEach(({ name, value, options }) =>
      event.cookies.set(name, value, { path: '/', ...options })
    );
  },
});
