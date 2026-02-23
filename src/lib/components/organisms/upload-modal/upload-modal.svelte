<script lang="ts">
	import { X, FileText } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormField from '$lib/components/molecules/form-field/form-field.svelte';
	import FileUploadZone from '$lib/components/molecules/file-upload-zone/file-upload-zone.svelte';

	export interface UploadFormData {
		file?: File;
		title: string;
		author?: string;
		description?: string;
		coverUrl?: string;
	}

	let {
		open = $bindable(false),
		onSubmit
	}: {
		open: boolean;
		onSubmit: (formData: UploadFormData) => Promise<void>;
	} = $props();

	let selectedFile = $state<File | null>(null);
	let isUploading = $state(false);

	// Form fields
	let title = $state('');
	let author = $state('');
	let description = $state('');
	let coverUrl = $state('');

	let error = $state<string | null>(null);

	function handleFileSelect(file: File) {
		selectedFile = file;
		// Auto-populate title from filename (remove extension)
		if (!title) {
			title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
		}
		error = null;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!selectedFile) {
			error = 'Please select a PDF file to upload';
			return;
		}
		if (!title) {
			error = 'Please provide a title';
			return;
		}

		const formData: UploadFormData = {
			file: selectedFile,
			title,
			author: author || undefined,
			description: description || undefined,
			coverUrl: coverUrl || undefined
		};

		isUploading = true;
		error = null;
		try {
			await onSubmit(formData);
			open = false;
			resetForm();
		} catch (submitError) {
			error = submitError instanceof Error ? submitError.message : 'Failed to upload book';
		} finally {
			isUploading = false;
		}
	}

	function resetForm() {
		selectedFile = null;
		isUploading = false;
		title = '';
		author = '';
		description = '';
		coverUrl = '';
		error = null;
	}

	function handleClose() {
		open = false;
		resetForm();
	}

	function removeSelectedFile() {
		selectedFile = null;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50" />
		<Dialog.Content
			class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-card p-6 shadow-lg"
		>
			<DialogHeader class="flex flex-row items-center justify-between">
				<Dialog.Title class="text-lg font-semibold">Add New Book</Dialog.Title>
				<Dialog.Close class="rounded-md p-1 hover:bg-accent" onclick={handleClose}>
					<X class="h-5 w-5" />
				</Dialog.Close>
			</DialogHeader>

			<form onsubmit={handleSubmit} class="flex flex-col gap-4 mt-4">
				<!-- File Upload -->
				{#if selectedFile}
					<div class="rounded-lg border bg-muted p-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="rounded bg-background p-2">
									<FileText class="h-5 w-5 text-muted-foreground" />
								</div>
								<div>
									<p class="font-medium text-sm">{selectedFile.name}</p>
									<p class="text-xs text-muted-foreground">
										{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
							</div>
							<button
								type="button"
								onclick={removeSelectedFile}
								class="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
							>
								<X class="h-4 w-4" />
							</button>
						</div>
					</div>
				{:else}
					<FileUploadZone onFileSelect={handleFileSelect} acceptedTypes={['.pdf']} maxSizeMB={50} />
				{/if}

				<!-- Title -->
				<FormField
					label="Title"
					name="title"
					type="text"
					value={title}
					placeholder="Enter book title"
					required={true}
					oninput={(v) => (title = v)}
				/>

				<!-- Author -->
				<FormField
					label="Author"
					name="author"
					type="text"
					value={author}
					placeholder="Enter author name"
					required={false}
					oninput={(v) => (author = v)}
				/>

				<!-- Description -->
				<FormField
					label="Description"
					name="description"
					type="textarea"
					value={description}
					placeholder="Enter description (optional)"
					required={false}
					rows={3}
					oninput={(v) => (description = v)}
				/>

				<!-- Error Message -->
				{#if error}
					<p class="text-sm text-red-500">{error}</p>
				{/if}

				<!-- Submit Button -->
				<div class="flex gap-2">
					<Button
						type="button"
						variant="outline"
						onclick={handleClose}
						disabled={isUploading}
						class="flex-1"
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isUploading || !selectedFile} class="flex-1">
						{#if isUploading}
							Uploading...
						{:else}
							Upload PDF
						{/if}
					</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
