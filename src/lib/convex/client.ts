import { ConvexClient } from 'convex/browser';
import { env } from '$env/dynamic/public';

type ConvexClientMethods = Pick<ConvexClient, 'query' | 'mutation' | 'action'>;

let cachedClient: ConvexClient | null = null;

export function createConvexClient(): ConvexClient {
	if (!env.PUBLIC_CONVEX_URL) {
		throw new Error('PUBLIC_CONVEX_URL is not set');
	}

	return new ConvexClient(env.PUBLIC_CONVEX_URL);
}

export function getConvexClient(): ConvexClient {
	if (!cachedClient) {
		cachedClient = createConvexClient();
	}

	return cachedClient;
}

export const convexClient: ConvexClientMethods = {
	query(...args) {
		return getConvexClient().query(...args);
	},
	mutation(...args) {
		return getConvexClient().mutation(...args);
	},
	action(...args) {
		return getConvexClient().action(...args);
	}
};
