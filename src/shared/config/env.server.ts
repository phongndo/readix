import { Schema } from '@effect/schema';
import { DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET } from '$env/static/private';
// Schema definition
const EnvSchema = Schema.Struct({
	BETTER_AUTH_SECRET: Schema.String.pipe(
		Schema.minLength(1, { message: () => 'BETTER_AUTH_SECRET is required' })
	),
	BETTER_AUTH_URL: Schema.String.pipe(
		Schema.filter((s) => URL.canParse(s), {
			message: () => 'BETTER_AUTH_URL must be a valid URL'
		})
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
	BETTER_AUTH_SECRET: BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: BETTER_AUTH_URL,
	DATABASE_URL: DATABASE_URL
});
