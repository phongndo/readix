import { z } from 'zod';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// ============ Zod Schemas ============

// Authenticated user (session data)
export const appUserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email(),
	avatarUrl: z.string().url().nullable().optional(),
	createdAt: z.string().datetime()
});

// Profile as stored in DB
export const profileSchema = z.object({
	id: z.string().uuid(),
	first_name: z.string().min(1),
	last_name: z.string().min(1),
	avatar_url: z.string().url().nullable(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime()
});
// For updating profile (partial, no id/timestamps)
export const updateProfileSchema = z.object({
	first_name: z.string().min(1, 'First name is required').optional(),
	last_name: z.string().min(1, 'Last name is required').optional(),
	avatar_url: z.string().url('Invalid URL').nullable().optional()
});
// ============ Inferred Types ============
export type AppUser = z.infer<typeof appUserSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============ Mappers ============
export function toAppUser(user: SupabaseUser): AppUser {
	return {
		id: user.id,
		email: user.email ?? '',
		avatarUrl: user.user_metadata?.avatar_url ?? null,
		createdAt: user.created_at
	};
}
