import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$shared/config';
import * as schema from '../db/schema';

// Supabase connection pooler (port 6543) requires prepare: false for Transaction mode
const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client, { schema });
