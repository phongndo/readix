import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/shared/api/db/schema/index.ts',
	out: './supabase/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	},
	verbose: true,
	strict: true
});
