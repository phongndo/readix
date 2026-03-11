import { Effect } from 'effect';
import Fuse from 'fuse.js';
import type { Id } from '$lib/convex/api';
import { searchDocumentPages } from '$lib/services/documentSearchService';
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
): { snippet: string; matchRanges: Array<{ start: number; end: number }> } {
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

	const matchRanges = findMatchRanges(snippet, query);
	return { snippet, matchRanges };
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findMatchRanges(text: string, query: string): Array<{ start: number; end: number }> {
	const ranges: Array<{ start: number; end: number }> = [];
	const queryWords = query
		.trim()
		.split(/\s+/)
		.filter((word) => word.length >= 2);

	for (const word of queryWords) {
		const regex = new RegExp(escapeRegex(word), 'gi');
		for (const match of text.matchAll(regex)) {
			if (match.index === undefined) continue;
			ranges.push({
				start: match.index,
				end: match.index + match[0].length
			});
		}
	}

	return ranges.sort((a, b) => a.start - b.start);
}

/**
 * Normalize query into lowercase phrase + terms.
 */
function normalizeQuery(query: string): { normalizedPhrase: string; queryTerms: string[] } {
	const normalizedPhrase = query.trim().toLowerCase();
	const queryTerms = normalizedPhrase.split(/\s+/).filter((word) => word.length >= 2);
	return { normalizedPhrase, queryTerms };
}

/**
 * Deterministic exact matching on currently indexed pages.
 * Prioritizes full phrase hits, then all-terms hits.
 */
function searchClientSideExact(query: string, loadedPages: SearchIndexEntry[]): SearchResult[] {
	const { normalizedPhrase, queryTerms } = normalizeQuery(query);
	if (!normalizedPhrase || queryTerms.length === 0) {
		return [];
	}

	const results: SearchResult[] = [];

	for (const page of loadedPages) {
		const lowerText = page.text.toLowerCase();
		const phraseIndex = lowerText.indexOf(normalizedPhrase);
		const hasAllTerms = queryTerms.every((term) => lowerText.includes(term));
		if (phraseIndex === -1 && !hasAllTerms) continue;

		const firstTermIndex = queryTerms
			.map((term) => lowerText.indexOf(term))
			.filter((index) => index >= 0)
			.sort((a, b) => a - b)[0];
		const bestIndex = phraseIndex >= 0 ? phraseIndex : (firstTermIndex ?? 0);
		const matchedLength = phraseIndex >= 0 ? normalizedPhrase.length : (queryTerms[0]?.length ?? 1);

		const { snippet, matchRanges } = extractSnippet(page.text, query, [
			[bestIndex, bestIndex + matchedLength - 1]
		]);
		const scoreBase = phraseIndex >= 0 ? 0 : 0.5;
		const score = scoreBase + bestIndex / Math.max(1, page.text.length);

		results.push({
			page: page.page,
			text: snippet,
			matchRanges,
			score
		});
	}

	return results.sort((a, b) => a.score - b.score || a.page - b.page).slice(0, 20);
}

/**
 * Fuzzy fallback for typo-tolerant search.
 */
function searchClientSideFuzzy(query: string, searchIndex: Fuse<SearchIndexEntry>): SearchResult[] {
	if (!query.trim() || query.trim().length < 3) {
		return [];
	}

	const results = searchIndex.search(query);
	return results.slice(0, 20).map((result) => {
		const item = result.item;
		const matches = result.matches?.[0];
		const indices = matches?.indices;
		const { snippet, matchRanges } = extractSnippet(item.text, query, indices);
		return {
			page: item.page,
			text: snippet,
			matchRanges,
			score: (result.score ?? 1) + 0.15
		};
	});
}

/**
 * Perform client-side search with exact-first + fuzzy fallback.
 */
export function searchClientSide(
	query: string,
	loadedPages: SearchIndexEntry[],
	searchIndex: Fuse<SearchIndexEntry> | null
): SearchResult[] {
	const exactResults = searchClientSideExact(query, loadedPages);
	const fuzzyResults = searchIndex ? searchClientSideFuzzy(query, searchIndex) : [];

	const seenPages = new Set<number>();
	const merged: SearchResult[] = [];

	for (const result of exactResults) {
		if (seenPages.has(result.page)) continue;
		seenPages.add(result.page);
		merged.push(result);
	}

	for (const result of fuzzyResults) {
		if (seenPages.has(result.page)) continue;
		seenPages.add(result.page);
		merged.push(result);
	}

	return merged.sort((a, b) => a.score - b.score || a.page - b.page).slice(0, 20);
}

/**
 * Perform server-side search using Convex searchIndex
 */
export function searchServerSide(
	bookId: Id<'books'>,
	query: string
): Effect.Effect<SearchResult[], Error, never> {
	return searchDocumentPages(bookId, query).pipe(
		Effect.map((results) =>
			results.map((doc, index) => {
				const { snippet, matchRanges } = extractSnippet(doc.text, query);

				return {
					page: doc.page,
					text: snippet,
					matchRanges,
					score: index * 0.1
				};
			})
		)
	);
}

/**
 * Hybrid search: combines client-side (fast) and server-side (comprehensive) search
 * Strategy:
 * 1. First search client-side on loaded pages
 * 2. If < 5 results, search server-side and merge
 * 3. Remove duplicates and sort by relevance
 */
export function hybridSearch(
	bookId: Id<'books'>,
	query: string,
	loadedPages: SearchIndexEntry[],
	searchIndex: Fuse<SearchIndexEntry> | null
): Effect.Effect<SearchResult[], Error, never> {
	return Effect.gen(function* () {
		// Step 1: Client-side search (fast, works offline)
		const clientResults = searchClientSide(query, loadedPages, searchIndex);

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
