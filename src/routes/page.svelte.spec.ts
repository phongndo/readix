import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

vi.mock('$lib/services/bookService', () => ({
	uploadBookWithFile: vi.fn(),
	checkDuplicateCandidates: vi.fn()
}));

vi.mock('svelte-clerk/client', () => ({
	useClerkContext: () => ({
		user: {
			id: 'user-1',
			firstName: 'Reader'
		}
	})
}));

describe('/+page.svelte', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('should render h1', async () => {
		render(Page, {
			props: {
				data: {
					books: [],
					stats: {
						totalBooksRead: 0,
						totalPagesRead: 0,
						totalReadingTime: 0
					},
					streak: {
						current: 0,
						longest: 0
					},
					userId: 'user-1',
					initialState: {} as never,
					achievements: [],
					activity: []
				}
			}
		});

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
