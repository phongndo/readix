import Fuse from 'fuse.js';
import type { Book } from '$lib/domain/book/Book';

const fuseOptions = {
	keys: [
		{ name: 'title', weight: 0.4 },
		{ name: 'author', weight: 0.3 },
		{ name: 'description', weight: 0.2 }
		// Note: extractedText search would require loading bookContent separately
	],
	threshold: 0.4,
	includeScore: true,
	minMatchCharLength: 2
};

export function createBookSearch(books: Book[]) {
	return new Fuse(books, fuseOptions);
}

export function searchBooks(books: Book[], query: string): Book[] {
	if (!query.trim()) return books;

	const fuse = createBookSearch(books);
	const results = fuse.search(query);
	return results.map((result) => result.item);
}
