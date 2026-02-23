<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import LibraryView from '$lib/features/library/LibraryView.svelte';
	import { libraryState } from '$lib/state/libraryState.svelte';
	import {
		deleteBook,
		fetchDeletePreview,
		syncBookTotalPages,
		uploadBookWithFile,
		type DeletePreview
	} from '$lib/services/bookService';
	import { getPdfPageCountFromUrl } from '$lib/services/document/pdf-metadata';
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
	const repairedBookIds = new SvelteSet<string>();
	const repairingBookIds = new SvelteSet<string>();

	$effect(() => {
		if (browser && data.books) {
			libraryState.setBooks(data.books);
		}
	});

	$effect(() => {
		if (!browser) return;
		const userId = page.data.userId;
		if (!userId) return;

		for (const book of libraryState.state.books) {
			if (!shouldRepairPdfPageCount(book)) continue;
			void repairPdfPageCount(book, userId);
		}
	});

	function shouldRepairPdfPageCount(book: Book): boolean {
		if (!book.fileStorageId) return false;
		if (book.totalPages > 1) return false;
		if (repairedBookIds.has(book.id) || repairingBookIds.has(book.id)) return false;

		const fileType = readOptionalString(book.fileType);
		const fileName = readOptionalString(book.fileName);
		const hasPdfMime = fileType === 'application/pdf';
		const hasPdfExtension = fileName?.toLowerCase().endsWith('.pdf') ?? false;
		return hasPdfMime || hasPdfExtension;
	}

	function readOptionalString(value: unknown): string | undefined {
		if (typeof value === 'string') return value;
		if (
			value &&
			typeof value === 'object' &&
			'_tag' in value &&
			'value' in value &&
			value._tag === 'Some' &&
			typeof value.value === 'string'
		) {
			return value.value;
		}
		return undefined;
	}

	async function repairPdfPageCount(book: Book, userId: string): Promise<void> {
		if (!book.fileStorageId) return;

		repairingBookIds.add(book.id);
		try {
			const pageCount = await getPdfPageCountFromUrl(`/api/files/${book.fileStorageId}`);
			if (!pageCount || pageCount <= 1) {
				return;
			}

			const normalizedCurrentPage = Math.max(0, Math.min(book.currentPage, pageCount));
			libraryState.updateBook(book.id, {
				totalPages: pageCount,
				currentPage: normalizedCurrentPage,
				isCompleted: normalizedCurrentPage >= pageCount,
				updatedAt: new Date()
			});
			repairedBookIds.add(book.id);

			try {
				const updatedBook = await Effect.runPromise(syncBookTotalPages(book.id, userId, pageCount));
				libraryState.updateBook(book.id, {
					totalPages: updatedBook.totalPages,
					currentPage: updatedBook.currentPage,
					isCompleted: updatedBook.isCompleted,
					updatedAt: updatedBook.updatedAt
				});
			} catch (error) {
				console.error('Failed to persist repaired PDF page count:', error);
			}
		} catch (error) {
			console.error('Failed to repair PDF page count:', error);
		} finally {
			repairingBookIds.delete(book.id);
		}
	}

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
