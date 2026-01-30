import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BookCard from './book-card.svelte';
import type { Book } from '$lib/domain/book/Book';

describe('BookCard', () => {
	const mockBook = {
		id: '1',
		title: 'Test Book',
		author: 'Test Author',
		description: '',
		totalPages: 100,
		currentPage: 50,
		isCompleted: false,
		content: '',
		coverUrl: null,
		userId: 'user1',
		createdAt: new Date(),
		updatedAt: new Date()
	} as unknown as Book;

	it('renders book title and author', async () => {
		const { getByText } = render(BookCard, {
			props: { book: mockBook }
		});
		await expect.element(getByText('Test Book')).toBeInTheDocument();
		await expect.element(getByText('Test Author')).toBeInTheDocument();
	});

	it('shows completed badge when book is completed', async () => {
		const completedBook = { ...mockBook, isCompleted: true, currentPage: 100 } as unknown as Book;
		const { getByText } = render(BookCard, {
			props: { book: completedBook }
		});
		await expect.element(getByText('Completed')).toBeInTheDocument();
	});

	it('renders as interactive when onClick provided', async () => {
		const { container } = render(BookCard, {
			props: {
				book: mockBook,
				onClick: () => {}
			}
		});
		const card = container.querySelector('[role="button"]');
		expect(card).toBeTruthy();
	});

	it('displays progress percentage', async () => {
		const { getByText } = render(BookCard, {
			props: { book: mockBook }
		});
		await expect.element(getByText('50%')).toBeInTheDocument();
	});
});
