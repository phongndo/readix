import { z } from 'zod';
// ============ Zod Schemas ============
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
export type Profile = z.infer<typeof profileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
