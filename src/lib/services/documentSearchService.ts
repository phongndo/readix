import { Effect } from 'effect';
import { convexClient } from '$lib/convex/client';
import { api, type Id } from '$lib/convex/api';

export interface DocumentSearchPage {
	page: number;
	text: string;
	wordCount: number;
}

export function searchDocumentPages(
	bookId: Id<'books'>,
	query: string
): Effect.Effect<DocumentSearchPage[], Error, never> {
	return Effect.tryPromise({
		try: async () => {
			if (!query.trim() || query.length < 3) {
				return [];
			}

			return await convexClient.query(api.documentText.searchDocument, {
				bookId,
				query
			});
		},
		catch: (error) => new Error(`Server search failed: ${error}`)
	});
}
