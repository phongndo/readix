<script lang="ts">
	import { X, Upload, FileText } from '@lucide/svelte';
	import { Tabs } from 'bits-ui';
	import * as Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormField from '$lib/components/molecules/form-field/form-field.svelte';
	import FileUploadZone from '$lib/components/molecules/file-upload-zone/file-upload-zone.svelte';
	import ProgressBar from '$lib/components/atoms/progress-bar/progress-bar.svelte';

	interface UploadFormData {
		file?: File;
		fileStorageId?: string;
		title: string;
		author?: string;
		description?: string;
		coverUrl?: string;
	}

	let { open = $bindable(false) }: { open: boolean } = $props();

	let activeTab = $state<'upload' | 'manual'>('upload');
	let selectedFile = $state<File | null>(null);
	let uploadProgress = $state(0);
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

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (activeTab === 'upload') {
			if (!selectedFile) {
				error = 'Please select a file to upload';
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

			const event = new CustomEvent('uploadbook', {
				detail: formData,
				bubbles: true
			});
			document.dispatchEvent(event);
		} else {
			// Manual entry
			if (!title) {
				error = 'Please provide a title';
				return;
			}

			const formData: UploadFormData = {
				title,
				author: author || undefined,
				description: description || undefined,
				coverUrl: coverUrl || undefined
			};

			const event = new CustomEvent('addbook', {
				detail: formData,
				bubbles: true
			});
			document.dispatchEvent(event);
		}

		open = false;
		resetForm();
	}

	function resetForm() {
		activeTab = 'upload';
		selectedFile = null;
		uploadProgress = 0;
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

			<!-- Tabs -->
			<Tabs.Root
				value={activeTab}
				onValueChange={(v) => (activeTab = v as 'upload' | 'manual')}
				class="mt-4"
			>
				<Tabs.List class="flex gap-2 mb-6">
					<Tabs.Trigger
						value="upload"
						class="flex-1 rounded-md py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80"
					>
						<Upload class="inline h-4 w-4 mr-1" />
						Upload File
					</Tabs.Trigger>
					<Tabs.Trigger
						value="manual"
						class="flex-1 rounded-md py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-muted/80"
					>
						Manual Entry
					</Tabs.Trigger>
				</Tabs.List>

				<form onsubmit={handleSubmit} class="flex flex-col gap-4">
					<!-- File Upload Tab -->
					<Tabs.Content value="upload">
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
							<FileUploadZone onFileSelect={handleFileSelect} maxSizeMB={50} />
						{/if}
					</Tabs.Content>

					<!-- Manual Entry Tab -->
					<Tabs.Content value="manual">
						<!-- Empty - forms show in both tabs -->
					</Tabs.Content>

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
						oninput={(v) => (author = v)}
					/>

					<!-- Description -->
					<FormField
						label="Description"
						name="description"
						type="textarea"
						value={description}
						placeholder="Brief description"
						rows={2}
						oninput={(v) => (description = v)}
					/>

					<!-- Cover URL -->
					<div class="grid gap-2">
						<label for="cover" class="text-sm font-medium">Cover URL</label>
						<input
							id="cover"
							type="url"
							value={coverUrl}
							class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
							placeholder="https://example.com/cover.jpg"
							oninput={(e) => (coverUrl = e.currentTarget.value)}
						/>
					</div>

					{#if error}
						<p class="text-sm text-red-500">{error}</p>
					{/if}

					{#if isUploading}
						<div class="grid gap-2">
							<div class="flex items-center justify-between text-sm">
								<span class="text-muted-foreground">Uploading...</span>
								<span class="font-medium">{uploadProgress}%</span>
							</div>
							<ProgressBar value={uploadProgress} animated={true} />
						</div>
					{/if}

					<div class="flex justify-end gap-2 pt-2">
						<Button type="button" variant="ghost" onclick={handleClose} disabled={isUploading}>
							Cancel
						</Button>
						<Button type="submit" disabled={isUploading}>
							{#if isUploading}
								Uploading...
							{:else}
								Add Book
							{/if}
						</Button>
					</div>
				</form>
			</Tabs.Root>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
