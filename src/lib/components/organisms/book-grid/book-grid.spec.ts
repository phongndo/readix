import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import BookGrid from './book-grid.svelte';
import type { Book } from '$lib/domain/book/Book';

describe('BookGrid', () => {
	const mockBooks = [
		{
			id: '1',
			title: 'Book 1',
			author: 'Author 1',
			description: '',
			totalPages: 100,
			currentPage: 50,
			isCompleted: false,
			content: '',
			coverUrl: null,
			userId: 'user1',
			createdAt: new Date(),
			updatedAt: new Date()
		},
		{
			id: '2',
			title: 'Book 2',
			author: 'Author 2',
			description: '',
			totalPages: 200,
			currentPage: 200,
			isCompleted: true,
			content: '',
			coverUrl: null,
			userId: 'user1',
			createdAt: new Date(),
			updatedAt: new Date()
		}
	] as unknown as Book[];

	it('renders book cards when books exist', async () => {
		const { getByText } = render(BookGrid, {
			props: { books: mockBooks }
		});
		await expect.element(getByText('Book 1')).toBeInTheDocument();
		await expect.element(getByText('Book 2')).toBeInTheDocument();
	});

	it('shows loading state', async () => {
		const { container } = render(BookGrid, {
			props: { books: [], isLoading: true }
		});
		const loader = container.querySelector('.animate-spin');
		expect(loader).toBeTruthy();
	});

	it('shows error state', async () => {
		const { getByText } = render(BookGrid, {
			props: { books: [], error: 'Failed to load books' }
		});
		await expect.element(getByText('Failed to load books')).toBeInTheDocument();
	});

	it('shows empty state with custom message', async () => {
		const { getByText } = render(BookGrid, {
			props: {
				books: [],
				emptyState: {
					title: 'No Books Found',
					description: 'Try a different search'
				}
			}
		});
		await expect.element(getByText('No Books Found')).toBeInTheDocument();
		await expect.element(getByText('Try a different search')).toBeInTheDocument();
	});
});
