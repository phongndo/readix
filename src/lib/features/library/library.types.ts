import type { Book } from '$lib/domain/book/Book';

export type LibraryViewProps = {
	books: Book[];
	isLoading: boolean;
	error: string | null;
};

export type BookCardProps = {
	book: Book;
	onClick: () => void;
	onDelete: () => void;
};

export type AddBookFormData = {
	title: string;
	author: string;
	description: string;
	totalPages: number;
	content: string;
	coverUrl?: string;
};
