<script lang="ts">
	import { SignedIn } from 'svelte-clerk';
	import LibraryView from '$lib/features/library/LibraryView.svelte';
	import { libraryStore } from '$lib/stores/libraryStore';
	import { addBook, removeBook } from '$lib/features/library/library.logic';
	import { uploadBookWithFile } from '$lib/services/bookService';
	import { Effect } from 'effect';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { data } = $props();

	$effect(() => {
		if (browser && data.books) {
			libraryStore.setBooks(data.books);
		}
	});

	$effect(() => {
		if (browser) {
			document.addEventListener('addbook', handleAddBook as EventListener);
			document.addEventListener('uploadbook', handleUploadBook as EventListener);
			document.addEventListener('deletebook', handleDeleteBook as EventListener);

			return () => {
				document.removeEventListener('addbook', handleAddBook as EventListener);
				document.removeEventListener('uploadbook', handleUploadBook as EventListener);
				document.removeEventListener('deletebook', handleDeleteBook as EventListener);
			};
		}
	});

	async function handleAddBook(e: Event) {
		const customEvent = e as CustomEvent;
		const userId = page.data.userId;
		if (!userId) return;

		try {
			await addBook(userId, customEvent.detail);
		} catch (error) {
			console.error('Failed to add book:', error);
		}
	}

	async function handleUploadBook(e: Event) {
		const customEvent = e as CustomEvent;
		const userId = page.data.userId;
		if (!userId) return;

		const { file, title, author, description, coverUrl, documentType } = customEvent.detail;

		if (!file) {
			// No file, treat as manual entry
			await addBook(userId, { title, author, description, coverUrl, totalPages: 0, content: '' });
			return;
		}

		try {
			await Effect.runPromise(
				uploadBookWithFile(userId, file, {
					title,
					author,
					description,
					coverUrl,
					documentType
				})
			);
			// Refresh the page to show the new book
			window.location.reload();
		} catch (error) {
			console.error('Failed to upload book:', error);
			alert('Failed to upload book. Please try again.');
		}
	}

	async function handleDeleteBook(e: Event) {
		const customEvent = e as CustomEvent;
		const userId = page.data.userId;
		if (!userId) return;

		try {
			await removeBook(customEvent.detail.bookId, userId);
		} catch (error) {
			console.error('Failed to delete book:', error);
		}
	}
</script>

<SignedIn>
	<div class="container mx-auto max-w-6xl p-4">
		<LibraryView
			books={$libraryStore.books}
			isLoading={$libraryStore.isLoading}
			error={$libraryStore.error}
		/>
	</div>
</SignedIn>
