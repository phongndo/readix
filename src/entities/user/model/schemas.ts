import { Schema } from '@effect/schema';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export type { Profile, NewProfile } from '$shared/api/db/schema';

export const UpdateProfileSchema = Schema.Struct({
  firstName: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => 'First name is required' })
    )
  ),
  lastName: Schema.optional(
    Schema.String.pipe(
      Schema.minLength(1, { message: () => 'Last name is required' })
    )
  ),
  avatarUrl: Schema.optional(Schema.NullOr(Schema.String))
});
export type UpdateProfileInput = typeof UpdateProfileSchema.Type;
export const decodeUpdateProfile = Schema.decodeUnknownEither(UpdateProfileSchema);

export const AppUserSchema = Schema.Struct({
  id: Schema.UUID,
  email: Schema.String,
  avatarUrl: Schema.NullOr(Schema.String),
  createdAt: Schema.String
});
export type AppUser = typeof AppUserSchema.Type;

export function toAppUser(user: SupabaseUser): AppUser {
  return {
    id: user.id,
    email: user.email ?? '',
    avatarUrl: user.user_metadata?.avatar_url ?? null,
    createdAt: user.created_at
  };
}
