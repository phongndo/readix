<script lang="ts">
	import { X } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormField from '$lib/components/molecules/form-field/form-field.svelte';
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
				<FormField
					label="Title"
					name="title"
					type="text"
					value={title}
					placeholder="Enter book title"
					required={true}
					oninput={(v) => (title = v)}
				/>

				<FormField
					label="Author"
					name="author"
					type="text"
					value={author}
					placeholder="Enter author name"
					required={true}
					oninput={(v) => (author = v)}
				/>

				<div class="grid gap-2">
					<label for="pages" class="text-sm font-medium">
						Total Pages <span class="text-red-500">*</span>
					</label>
					<input
						id="pages"
						type="number"
						value={totalPages}
						min="1"
						class="w-full rounded-md border border-neutral-700 bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
						placeholder="Number of pages"
						oninput={(e) => (totalPages = parseInt(e.currentTarget.value) || 0)}
					/>
				</div>

				<FormField
					label="Description"
					name="description"
					type="textarea"
					value={description}
					placeholder="Brief description (optional)"
					rows={2}
					oninput={(v) => (description = v)}
				/>

				<div class="grid gap-2">
					<label for="cover" class="text-sm font-medium">Cover URL</label>
					<input
						id="cover"
						type="url"
						value={coverUrl}
						class="w-full rounded-md border border-neutral-700 bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
						placeholder="https://example.com/cover.jpg"
						oninput={(e) => (coverUrl = e.currentTarget.value)}
					/>
				</div>

				<FormField
					label="Content"
					name="content"
					type="textarea"
					value={content}
					placeholder="Paste book content here..."
					required={true}
					rows={6}
					oninput={(v) => (content = v)}
				/>

				{#if error}
					<p class="text-sm text-red-500">{error}</p>
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
