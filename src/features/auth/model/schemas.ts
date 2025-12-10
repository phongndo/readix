import { Schema } from '@effect/schema';

import type {
	AuthError,
	AuthResponse,
	AuthTokenResponsePassword,
	OAuthResponse
} from '@supabase/supabase-js';

const Email = Schema.String.pipe(
	Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
		message: () => 'Invalid email address'
	})
);

// Password schema with min length
const Password = Schema.String.pipe(
	Schema.minLength(6, {
		message: () => 'Password must be at least 6 characters'
	})
);

// Required string
const RequiredString = (field: string) =>
	Schema.String.pipe(Schema.minLength(1, { message: () => `${field} is required` }));

// Login schema
export const LoginSchema = Schema.Struct({
	email: Email,
	password: Password
});

// Signup schema
export const SignupSchema = Schema.Struct({
	firstname: RequiredString('First name'),
	lastname: RequiredString('Last name'),
	email: Email,
	password: Password
});

export type LoginInput = typeof LoginSchema.Type;
export type SignupInput = typeof SignupSchema.Type;

export const decodeLoginInput = Schema.decodeUnknownEither(LoginSchema);
export const decodeSignupInput = Schema.decodeUnknownEither(SignupSchema);

export type AuthProvider = 'google' | 'github';
export type SignInResult = AuthTokenResponsePassword;
export type SignUpResult = AuthResponse;
export type OAuthResult = OAuthResponse;
export type SignOutResult = { error: AuthError | null };
