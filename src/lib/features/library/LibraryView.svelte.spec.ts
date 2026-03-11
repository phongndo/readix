import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LibraryViewTestWrapper from './LibraryViewTestWrapper.svelte';
import { libraryState } from '$lib/state/libraryState.svelte';
import type { Book } from '$lib/domain/book/Book';

vi.mock('$lib/services/bookService', () => ({
	checkDuplicateCandidates: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

const mockBooks = [
	{
		id: 'book-1',
		userId: 'user-1',
		title: 'Atomic Habits',
		author: 'James Clear',
		description: '',
		coverUrl: '',
		totalPages: 320,
		currentPage: 40,
		content: '',
		isCompleted: false,
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-02')
	},
	{
		id: 'book-2',
		userId: 'user-1',
		title: 'Clean Code',
		author: 'Robert C. Martin',
		description: '',
		coverUrl: '',
		totalPages: 450,
		currentPage: 450,
		content: '',
		isCompleted: true,
		createdAt: new Date('2026-01-03'),
		updatedAt: new Date('2026-01-04')
	}
] as unknown as Book[];

describe('LibraryView', () => {
	beforeEach(() => {
		libraryState.reset();
	});

	it('switches between grid and list rendering modes', async () => {
		const onUploadBook = vi.fn().mockResolvedValue(undefined);
		const onDeleteBook = vi.fn().mockResolvedValue(undefined);
		const onGetDeletePreview = vi.fn().mockResolvedValue({
			bookId: 'book-1',
			title: 'Atomic Habits',
			fileName: 'atomic-habits.pdf',
			hasStoredFile: true,
			counts: {
				bookContent: 1,
				documentText: 3,
				readingPositions: 1,
				bookmarks: 1,
				annotations: 1,
				readingSessions: 2,
				fileStorage: 1
			},
			totalRecords: 10
		});

		libraryState.setBooks(mockBooks);

		const { container, getByText } = render(LibraryViewTestWrapper, {
			props: {
				books: mockBooks,
				isLoading: false,
				error: null,
				onUploadBook,
				onDeleteBook,
				onGetDeletePreview
			}
		});

		await expect.element(getByText('Atomic Habits')).toBeInTheDocument();
		expect(container.querySelector('[aria-label="Read book"]')).toBeNull();

		libraryState.setViewMode('list');
		await new Promise((resolve) => setTimeout(resolve, 0));

		const readButtons = container.querySelectorAll('[aria-label="Read book"]');
		expect(readButtons.length).toBeGreaterThan(0);
	});
});
