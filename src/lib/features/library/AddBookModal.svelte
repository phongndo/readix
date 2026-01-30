<script lang="ts">
	import { X } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { AddBookFormData } from './library.types';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let title = $state('');
	let author = $state('');
	let description = $state('');
	let totalPages = $state(0);
	let content = $state('');
	let coverUrl = $state('');
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!title || !author || totalPages <= 0 || !content) {
			error = 'Please fill in all required fields';
			return;
		}

		const formData: AddBookFormData = {
			title,
			author,
			description,
			totalPages,
			content,
			coverUrl: coverUrl || undefined
		};

		const event = new CustomEvent('addbook', {
			detail: formData,
			bubbles: true
		});
		document.dispatchEvent(event);

		open = false;
		resetForm();
	}

	function resetForm() {
		title = '';
		author = '';
		description = '';
		totalPages = 0;
		content = '';
		coverUrl = '';
		error = null;
	}

	function handleClose() {
		open = false;
		resetForm();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold">Add New Book</h2>
				<button onclick={handleClose} class="rounded-md p-1 hover:bg-accent">
					<X class="h-5 w-5" />
				</button>
			</div>

			<form onsubmit={handleSubmit} class="flex flex-col gap-4">
				<div class="grid gap-2">
					<label for="title" class="text-sm font-medium">
						Title <span class="text-destructive">*</span>
					</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="Enter book title"
					/>
				</div>

				<div class="grid gap-2">
					<label for="author" class="text-sm font-medium">
						Author <span class="text-destructive">*</span>
					</label>
					<input
						id="author"
						type="text"
						bind:value={author}
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="Enter author name"
					/>
				</div>

				<div class="grid gap-2">
					<label for="pages" class="text-sm font-medium">
						Total Pages <span class="text-destructive">*</span>
					</label>
					<input
						id="pages"
						type="number"
						bind:value={totalPages}
						min="1"
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="Number of pages"
					/>
				</div>

				<div class="grid gap-2">
					<label for="description" class="text-sm font-medium">Description</label>
					<textarea
						id="description"
						bind:value={description}
						rows="2"
						class="rounded-md border bg-background px-3 py-2 text-sm resize-none"
						placeholder="Brief description (optional)"
					></textarea>
				</div>

				<div class="grid gap-2">
					<label for="cover" class="text-sm font-medium">Cover URL</label>
					<input
						id="cover"
						type="url"
						bind:value={coverUrl}
						class="rounded-md border bg-background px-3 py-2 text-sm"
						placeholder="https://example.com/cover.jpg"
					/>
				</div>

				<div class="grid gap-2">
					<label for="content" class="text-sm font-medium">
						Content <span class="text-destructive">*</span>
					</label>
					<textarea
						id="content"
						bind:value={content}
						rows="6"
						class="rounded-md border bg-background px-3 py-2 text-sm resize-none font-mono text-xs"
						placeholder="Paste book content here..."
					></textarea>
				</div>

				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}

				<div class="flex justify-end gap-2 pt-2">
					<Button type="button" variant="ghost" onclick={handleClose}>Cancel</Button>
					<Button type="submit" disabled={isSubmitting}>
						{#if isSubmitting}
							Adding...
						{:else}
							Add Book
						{/if}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
