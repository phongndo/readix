<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import LibraryView from './LibraryView.svelte';
	import type { Book } from '$lib/domain/book/Book';
	import type { UploadFormData } from '$lib/components/organisms/upload-modal/upload-modal.svelte';
	import type { DeletePreview } from '$lib/services/bookService';

	let {
		books,
		isLoading,
		error,
		onUploadBook,
		onDeleteBook,
		onGetDeletePreview
	}: {
		books: Book[];
		isLoading: boolean;
		error: string | null;
		onUploadBook: (formData: UploadFormData) => Promise<void>;
		onDeleteBook: (book: Book) => Promise<void>;
		onGetDeletePreview: (bookId: string) => Promise<DeletePreview>;
	} = $props();
</script>

<Tooltip.Provider>
	<LibraryView {books} {isLoading} {error} {onUploadBook} {onDeleteBook} {onGetDeletePreview} />
</Tooltip.Provider>
