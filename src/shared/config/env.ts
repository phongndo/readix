import { Schema } from '@effect/schema';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { DATABASE_URL } from '$env/static/private';
// Schema definition
const EnvSchema = Schema.Struct({
  SUPABASE_URL: Schema.String.pipe(
    Schema.filter((s) => URL.canParse(s), {
      message: () => 'SUPABASE_URL must be a valid URL'
    })
  ),
  SUPABASE_PUBLISHABLE_KEY: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'SUPABASE_PUBLISHABLE_KEY is required' })
  ),
  DATABASE_URL: Schema.String.pipe(
    Schema.minLength(1, { message: () => 'DATABASE_URL is required' })
  )
});
// Type inference
export type Env = typeof EnvSchema.Type;
// Parse and validate (throws on error - acceptable at startup)
const decodeEnv = Schema.decodeUnknownSync(EnvSchema);
export const env: Env = decodeEnv({
  SUPABASE_URL: PUBLIC_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  DATABASE_URL: DATABASE_URL
});
