import { Effect } from 'effect';
import { convexClient } from '$lib/convex/client';
import { api } from '$lib/convex/api';
import { DatabaseError } from '$lib/effect/errors';

export function lookupConvexUserByClerkId(
	clerkId: string
): Effect.Effect<{ _id: string } | null, DatabaseError> {
	return Effect.tryPromise({
		try: () => convexClient.query(api.users.getByClerkId, { clerkId }),
		catch: (error) => new DatabaseError('Failed to lookup user', error)
	});
}
