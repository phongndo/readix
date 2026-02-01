import { Option } from 'effect';
import { browser } from '$app/environment';
import { libraryState } from '$lib/state/libraryState.svelte';
import { fetchBooksByUser, createBook, deleteBook } from '$lib/services/bookService';
import { AppRuntime } from '$lib/effect/runtime';
import { type CreateBookInput } from '$lib/domain/book/Book';
import type { AddBookFormData } from './library.types';

export async function loadUserBooks(userId: string): Promise<void> {
	if (!browser) return;

	libraryState.setLoading();

	const effect = fetchBooksByUser(userId);

	try {
		const books = await AppRuntime(effect);
		libraryState.setBooks(books);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to load books';
		libraryState.setError(errorMessage);
	}
}

export async function addBook(userId: string, formData: AddBookFormData): Promise<void> {
	if (!browser) return;

	const input: CreateBookInput = {
		title: formData.title,
		author: formData.author ? Option.some(formData.author) : Option.none(),
		description: formData.description ? Option.some(formData.description) : Option.none(),
		coverUrl: formData.coverUrl ? Option.some(formData.coverUrl) : Option.none(),
		totalPages: formData.totalPages,
		content: formData.content
	};

	const effect = createBook(userId, input);

	try {
		const book = await AppRuntime(effect);
		libraryState.addBook(book);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to add book';
		libraryState.setError(errorMessage);
		throw new Error(errorMessage);
	}
}

export async function removeBook(bookId: string, userId: string): Promise<void> {
	if (!browser) return;

	const effect = deleteBook(bookId, userId);

	try {
		await AppRuntime(effect);
		libraryState.removeBook(bookId);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Failed to delete book';
		libraryState.setError(errorMessage);
		throw new Error(errorMessage);
	}
}
