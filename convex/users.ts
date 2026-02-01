import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get user by Clerk ID
 * Used to lookup Convex user ID from Clerk authentication
 */
export const getByClerkId = query({
	args: {
		clerkId: v.string()
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
			.first();
	}
});
