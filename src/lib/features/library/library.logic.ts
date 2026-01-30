import { Option } from 'effect';
import { browser } from '$app/environment';
import { libraryStore } from '$lib/stores/libraryStore';
import { fetchBooksByUser, createBook, deleteBook } from '$lib/services/bookService';
import { AppRuntime } from '$lib/server/effect/runtime';
import { type CreateBookInput } from '$lib/domain/book/Book';
import type { AddBookFormData } from './library.types';

export async function loadUserBooks(userId: string): Promise<void> {
	if (!browser) return;

	libraryStore.setLoading();

	const effect = fetchBooksByUser(userId);

	try {
		const books = await AppRuntime(effect);
		libraryStore.setBooks(books);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to load books';
		libraryStore.setError(errorMessage);
	}
}

export async function addBook(userId: string, formData: AddBookFormData): Promise<void> {
	if (!browser) return;

	const input: CreateBookInput = {
		title: formData.title,
		author: formData.author,
		description: formData.description ? Option.some(formData.description) : Option.none(),
		coverUrl: formData.coverUrl ? Option.some(formData.coverUrl) : Option.none(),
		totalPages: formData.totalPages,
		content: formData.content
	};

	const effect = createBook(userId, input);

	try {
		const book = await AppRuntime(effect);
		libraryStore.addBook(book);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to add book';
		libraryStore.setError(errorMessage);
		throw new Error(errorMessage);
	}
}

export async function removeBook(bookId: string, userId: string): Promise<void> {
	if (!browser) return;

	const effect = deleteBook(bookId, userId);

	try {
		await AppRuntime(effect);
		libraryStore.removeBook(bookId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to delete book';
		libraryStore.setError(errorMessage);
		throw new Error(errorMessage);
	}
}
