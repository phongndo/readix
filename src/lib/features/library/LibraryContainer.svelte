<script lang="ts">
	import { SignedIn } from 'svelte-clerk';
	import LibraryView from '$lib/features/library/LibraryView.svelte';
	import { libraryState } from '$lib/state/libraryState.svelte';
	import { convexLibraryStore } from '$lib/state/convexLibraryStore.svelte';
	import { addBook, removeBook } from '$lib/features/library/library.logic';
	import { uploadBookWithFile } from '$lib/services/bookService';
	import { Effect } from 'effect';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import type { Book } from '$lib/domain/book/Book';

	let {
		data
	}: {
		data: {
			books: Book[];
		};
	} = $props();

	// Initialize with server data on load
	$effect(() => {
		if (browser && data.books) {
			libraryState.setBooks(data.books);
			convexLibraryStore.clear();
		}
	});

	// One-time fetch from Convex when userId is available
	let initialFetchDone = $state(false);
	$effect(() => {
		if (!browser || initialFetchDone) return;

		const userId = page.data.userId;
		if (userId) {
			// Initial fetch from Convex (manual, no polling)
			convexLibraryStore.fetchBooks(userId);
			initialFetchDone = true;
		}
	});

	$effect(() => {
		if (!browser) return;

		const addHandler = (e: Event) => handleAddBook(e as CustomEvent);
		const uploadHandler = (e: Event) => handleUploadBook(e as CustomEvent);
		const deleteHandler = (e: Event) => handleDeleteBook(e as CustomEvent);

		document.addEventListener('addbook', addHandler);
		document.addEventListener('uploadbook', uploadHandler);
		document.addEventListener('deletebook', deleteHandler);

		return () => {
			document.removeEventListener('addbook', addHandler);
			document.removeEventListener('uploadbook', uploadHandler);
			document.removeEventListener('deletebook', deleteHandler);
		};
	});

	async function handleAddBook(e: CustomEvent) {
		const userId = page.data.userId;
		if (!userId) return;

		try {
			await addBook(userId, e.detail);
			// Manual refresh after adding book
			await convexLibraryStore.refresh(userId);
		} catch (error) {
			console.error('Failed to add book:', error);
		}
	}

	async function handleUploadBook(e: CustomEvent) {
		const userId = page.data.userId;
		if (!userId) return;

		const { file, title, author, description, coverUrl, documentType } = e.detail;

		if (!file) {
			await addBook(userId, { title, author, description, coverUrl, totalPages: 0, content: '' });
			return;
		}

		const effect = uploadBookWithFile(userId, file, {
			title,
			author,
			description,
			coverUrl,
			documentType
		});

		await Effect.runPromise(
			effect.pipe(
				Effect.tap(() => {
					console.log('[LibraryContainer] Book uploaded successfully');
					// Manual refresh after upload
					convexLibraryStore.refresh(userId);
				}),
				Effect.catchAll((error) => {
					console.error('Failed to upload book:', error);
					alert('Failed to upload book. Please try again.');
					return Effect.succeed(undefined);
				})
			)
		);
	}

	async function handleDeleteBook(e: CustomEvent) {
		const userId = page.data.userId;
		if (!userId) return;

		try {
			await removeBook(e.detail.bookId, userId);
			// Manual refresh after deletion
			await convexLibraryStore.refresh(userId);
		} catch (error) {
			console.error('Failed to delete book:', error);
		}
	}
</script>

<SignedIn>
	<div class="container mx-auto max-w-6xl p-4">
		<LibraryView
			books={convexLibraryStore.hasData ? convexLibraryStore.books : libraryState.state.books}
			isLoading={convexLibraryStore.isLoading || libraryState.state.isLoading}
			error={convexLibraryStore.error || libraryState.state.error}
		/>
	</div>
</SignedIn>
