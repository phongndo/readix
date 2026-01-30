import { ConvexClient } from 'convex/browser';
import { env } from '$env/dynamic/public';

export function createConvexClient(): ConvexClient {
	if (!env.PUBLIC_CONVEX_URL) {
		throw new Error('PUBLIC_CONVEX_URL is not set');
	}

	return new ConvexClient(env.PUBLIC_CONVEX_URL);
}

export const convexClient = createConvexClient();
