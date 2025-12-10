import { z } from 'zod';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { DATABASE_URL } from '$env/static/private';
const envSchema = z.object({
	SUPABASE_URL: z.url(),
	SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
	DATABASE_URL: z.string().min(1)
});
export const env = envSchema.parse({
	SUPABASE_URL: PUBLIC_SUPABASE_URL,
	SUPABASE_PUBLISHABLE_KEY: PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	DATABASE_URL: DATABASE_URL
});
