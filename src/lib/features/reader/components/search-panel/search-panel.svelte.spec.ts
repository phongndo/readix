import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SearchPanel from './search-panel.svelte';
import { readerStore } from '$lib/features/reader/reader.store.svelte';

vi.mock('$lib/features/reader/search-logic', () => ({
	hybridSearch: vi.fn()
}));

describe('SearchPanel', () => {
	beforeEach(() => {
		readerStore.reset();
		readerStore.setTotalPages(20);
	});

	it('renders result snippets as text without HTML injection', () => {
		const onJumpToPage = vi.fn();
		readerStore.setSearchQuery('malicious');
		readerStore.setSearchResults([
			{
				page: 4,
				text: 'malicious <img src=x onerror=alert(1)> content',
				matchRanges: [{ start: 0, end: 9 }],
				score: 0.01
			}
		]);

		const { container } = render(SearchPanel, {
			props: {
				bookId: 'book-1',
				onJumpToPage
			}
		});

		expect(container.querySelector('img')).toBeNull();
		expect(container.textContent).toContain('<img src=x onerror=alert(1)>');
	});

	it('clicking a result jumps to page and updates active result index', () => {
		const onJumpToPage = vi.fn();
		readerStore.setSearchQuery('reader');
		readerStore.setSearchResults([
			{
				page: 2,
				text: 'reader intro',
				matchRanges: [{ start: 0, end: 6 }],
				score: 0.01
			},
			{
				page: 8,
				text: 'reader advanced',
				matchRanges: [{ start: 0, end: 6 }],
				score: 0.02
			}
		]);

		const { container } = render(SearchPanel, {
			props: {
				bookId: 'book-1',
				onJumpToPage
			}
		});

		const button = Array.from(container.querySelectorAll('button')).find((candidate) =>
			candidate.textContent?.includes('Page 8')
		);
		expect(button).not.toBeNull();

		button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onJumpToPage).toHaveBeenCalledWith(8);
		expect(readerStore.activeSearchResultIndex).toBe(1);
	});
});
