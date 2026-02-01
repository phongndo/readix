import { Effect } from 'effect';
import Fuse from 'fuse.js';
import { convexClient } from '$lib/convex/client';
import { api } from '$lib/convex/api';
import type { SearchResult } from './reader.types';

// Fuse.js options for fuzzy search
const fuseOptions = {
	keys: ['text'],
	threshold: 0.4,
	minMatchCharLength: 3,
	includeScore: true,
	includeMatches: true,
	shouldSort: true
};

// Type for search index entry
interface SearchIndexEntry {
	page: number;
	text: string;
	wordCount: number;
}

/**
 * Create a Fuse.js search index from loaded pages
 */
export function createSearchIndex(pages: SearchIndexEntry[]): Fuse<SearchIndexEntry> {
	return new Fuse(pages, fuseOptions);
}

/**
 * Extract highlighted snippet around the match
 * Shows 100 characters around the match with the matching word highlighted
 */
function extractSnippet(
	text: string,
	query: string,
	matchIndices?: readonly [number, number][]
): { snippet: string; highlightedText: string } {
	const lowerText = text.toLowerCase();
	const lowerQuery = query.toLowerCase();

	// Find the best match position
	let matchStart = lowerText.indexOf(lowerQuery);

	// If no direct match, try to find partial matches from Fuse indices
	if (matchStart === -1 && matchIndices && matchIndices.length > 0) {
		matchStart = matchIndices[0][0];
	}

	// If still no match, use the first occurrence of any query word
	if (matchStart === -1) {
		const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length >= 3);
		for (const word of queryWords) {
			const pos = lowerText.indexOf(word);
			if (pos !== -1) {
				matchStart = pos;
				break;
			}
		}
	}

	// Default to start if no match found
	if (matchStart === -1) {
		matchStart = 0;
	}

	// Calculate snippet boundaries (50 chars before and after)
	const snippetStart = Math.max(0, matchStart - 50);
	const snippetEnd = Math.min(text.length, matchStart + query.length + 50);

	let snippet = text.slice(snippetStart, snippetEnd);

	// Add ellipsis if needed
	if (snippetStart > 0) snippet = '...' + snippet;
	if (snippetEnd < text.length) snippet = snippet + '...';

	// Create highlighted version
	const highlightedText = highlightMatches(snippet, query);

	return { snippet, highlightedText };
}

/**
 * Highlight matching words in text
 */
function highlightMatches(text: string, query: string): string {
	const queryWords = query
		.toLowerCase()
		.split(/\s+/)
		.filter((w) => w.length >= 2);
	let highlighted = text;

	for (const word of queryWords) {
		const regex = new RegExp(`(${escapeRegex(word)})`, 'gi');
		highlighted = highlighted.replace(regex, '<mark>$1</mark>');
	}

	return highlighted;
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Perform client-side search using Fuse.js
 */
export function searchClientSide(
	query: string,
	searchIndex: Fuse<SearchIndexEntry>
): SearchResult[] {
	if (!query.trim() || query.length < 3) {
		return [];
	}

	const results = searchIndex.search(query);

	return results.slice(0, 20).map((result) => {
		const item = result.item;
		const matches = result.matches?.[0];
		const indices = matches?.indices;

		const { snippet, highlightedText } = extractSnippet(item.text, query, indices);

		return {
			page: item.page,
			text: snippet,
			highlightedText,
			score: result.score ?? 1
		};
	});
}

/**
 * Perform server-side search using Convex searchIndex
 */
export function searchServerSide(
	bookId: string,
	query: string
): Effect.Effect<SearchResult[], Error, never> {
	return Effect.tryPromise({
		try: async () => {
			if (!query.trim() || query.length < 3) {
				return [];
			}

			const results = await convexClient.query(api.documentText.searchDocument, {
				bookId: bookId as any,
				query
			});

			return results.map(
				(doc: { page: number; text: string; wordCount: number }, index: number) => {
					const { snippet, highlightedText } = extractSnippet(doc.text, query);

					return {
						page: doc.page,
						text: snippet,
						highlightedText,
						score: index * 0.1 // Lower score = higher relevance
					};
				}
			);
		},
		catch: (error) => new Error(`Server search failed: ${error}`)
	});
}

/**
 * Hybrid search: combines client-side (fast) and server-side (comprehensive) search
 * Strategy:
 * 1. First search client-side on loaded pages
 * 2. If < 5 results, search server-side and merge
 * 3. Remove duplicates and sort by relevance
 */
export function hybridSearch(
	bookId: string,
	query: string,
	loadedPages: SearchIndexEntry[],
	searchIndex: Fuse<SearchIndexEntry> | null
): Effect.Effect<SearchResult[], Error, never> {
	return Effect.gen(function* () {
		// Step 1: Client-side search (fast, works offline)
		let clientResults: SearchResult[] = [];
		if (searchIndex && query.trim().length >= 3) {
			clientResults = searchClientSide(query, searchIndex);
		}

		// Step 2: If we have few client results, search server-side
		let serverResults: SearchResult[] = [];
		if (clientResults.length < 5 && query.trim().length >= 3) {
			serverResults = yield* searchServerSide(bookId, query);
		}

		// Step 3: Merge and deduplicate
		const seenPages = new Set<number>();
		const merged: SearchResult[] = [];

		// Add client results first (more relevant for loaded pages)
		for (const result of clientResults) {
			if (!seenPages.has(result.page)) {
				seenPages.add(result.page);
				merged.push(result);
			}
		}

		// Add server results for pages not in client results
		for (const result of serverResults) {
			if (!seenPages.has(result.page)) {
				seenPages.add(result.page);
				merged.push(result);
			}
		}

		// Sort by score (lower is better)
		return merged.sort((a, b) => a.score - b.score).slice(0, 20);
	});
}

/**
 * Save extracted text to Convex for a page
 */
export function savePageText(
	bookId: string,
	page: number,
	text: string
): Effect.Effect<string, Error, never> {
	return Effect.tryPromise({
		try: async () => {
			const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

			const docId = await convexClient.mutation(api.documentText.extractPageText, {
				bookId: bookId as any,
				page,
				text,
				wordCount
			});

			return docId;
		},
		catch: (error) => new Error(`Failed to save page text: ${error}`)
	});
}

/**
 * Check if page text already exists in database
 */
export function pageTextExists(bookId: string, page: number): Effect.Effect<boolean, Error, never> {
	return Effect.tryPromise({
		try: async () => {
			const exists = await convexClient.query(api.documentText.pageTextExists, {
				bookId: bookId as any,
				page
			});

			return exists;
		},
		catch: (error) => new Error(`Failed to check page text: ${error}`)
	});
}
