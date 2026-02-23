<script lang="ts">
	import LibraryView from '$lib/features/library/LibraryView.svelte';
	import { libraryState } from '$lib/state/libraryState.svelte';
	import {
		deleteBook,
		fetchDeletePreview,
		uploadBookWithFile,
		type DeletePreview
	} from '$lib/services/bookService';
	import { Effect } from 'effect';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { Book } from '$lib/domain/book/Book';
	import type { UploadFormData } from '$lib/components/organisms/upload-modal/upload-modal.svelte';

	let {
		data
	}: {
		data: {
			books: Book[];
		};
	} = $props();

	let isMutating = $state(false);
	let requestError = $state<string | null>(null);

	$effect(() => {
		if (browser && data.books) {
			libraryState.setBooks(data.books);
		}
	});

	async function handleUploadBook(formData: UploadFormData): Promise<void> {
		const userId = page.data.userId;
		if (!userId) {
			throw new Error('Not authenticated');
		}

		if (!formData.file) {
			throw new Error('A PDF file is required');
		}

		requestError = null;
		isMutating = true;
		try {
			const createdBook = await Effect.runPromise(
				uploadBookWithFile(userId, formData.file, {
					title: formData.title,
					author: formData.author,
					description: formData.description,
					coverUrl: formData.coverUrl
				})
			);
			libraryState.addBook(createdBook);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to upload book';
			requestError = message;
			libraryState.setError(message);
			throw new Error(message, { cause: error });
		} finally {
			isMutating = false;
		}
	}

	async function handleDeleteBook(book: Book): Promise<void> {
		const userId = page.data.userId;
		if (!userId) {
			throw new Error('Not authenticated');
		}

		requestError = null;
		isMutating = true;
		try {
			await Effect.runPromise(deleteBook(book.id, userId));
			libraryState.removeBook(book.id);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to delete book';
			requestError = message;
			libraryState.setError(message);
			throw new Error(message, { cause: error });
		} finally {
			isMutating = false;
		}
	}

	async function handleGetDeletePreview(bookId: string): Promise<DeletePreview> {
		const userId = page.data.userId;
		if (!userId) {
			throw new Error('Not authenticated');
		}

		try {
			return await Effect.runPromise(fetchDeletePreview(bookId, userId));
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load delete preview';
			requestError = message;
			throw new Error(message, { cause: error });
		}
	}
</script>

<div class="container mx-auto max-w-6xl p-4">
	<LibraryView
		books={libraryState.state.books}
		isLoading={libraryState.state.isLoading || isMutating}
		error={requestError || libraryState.state.error}
		onUploadBook={handleUploadBook}
		onDeleteBook={handleDeleteBook}
		onGetDeletePreview={handleGetDeletePreview}
	/>
</div>
