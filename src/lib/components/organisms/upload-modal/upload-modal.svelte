<script lang="ts">
	import { Effect } from 'effect';
	import { X, FileText } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import FormField from '$lib/components/molecules/form-field/form-field.svelte';
	import FileUploadZone from '$lib/components/molecules/file-upload-zone/file-upload-zone.svelte';
	import { sanitizeExtractedMetadata } from '$lib/domain/book/metadataNormalization';
	import { checkDuplicateCandidates, type DuplicateCheckResult } from '$lib/services/bookService';
	import { extractPdfUploadMetadata } from '$lib/services/document/pdf-thumbnail';
	import { computeFileSha256 } from '$lib/services/document/file-hash';

	export interface UploadFormData {
		file?: File;
		title: string;
		author?: string;
		description?: string;
		coverUrl?: string;
		allowDuplicate?: boolean;
	}

	let {
		open = $bindable(false),
		userId,
		onSubmit
	}: {
		open: boolean;
		userId?: string;
		onSubmit: (formData: UploadFormData) => Promise<void>;
	} = $props();

	let selectedFile = $state<File | null>(null);
	let isUploading = $state(false);
	let isAnalyzingFile = $state(false);

	// Form fields
	let title = $state('');
	let author = $state('');
	let description = $state('');
	let coverUrl = $state('');
	let detectedTotalPages = $state(1);
	let detectedFileHash = $state<string | undefined>(undefined);
	let duplicateCheck = $state<DuplicateCheckResult>({
		exactDuplicates: [],
		fuzzyDuplicates: []
	});
	let showDuplicateConfirmation = $state(false);

	let error = $state<string | null>(null);

	async function handleFileSelect(file: File) {
		selectedFile = file;
		error = null;
		showDuplicateConfirmation = false;
		duplicateCheck = {
			exactDuplicates: [],
			fuzzyDuplicates: []
		};

		const fallbackTitle = file.name
			.replace(/\.[^/.]+$/, '')
			.replace(/[_-]+/g, ' ')
			.trim();
		title = fallbackTitle || 'Untitled';
		author = '';
		coverUrl = '';
		detectedTotalPages = 1;
		detectedFileHash = undefined;

		isAnalyzingFile = true;
		try {
			const [metadata, fileHash] = await Promise.all([
				extractPdfUploadMetadata(file).catch(() => undefined),
				computeFileSha256(file).catch(() => undefined)
			]);

			detectedFileHash = fileHash;

			const sanitized = sanitizeExtractedMetadata({
				fileName: file.name,
				embeddedTitle: metadata?.embeddedTitle,
				embeddedAuthor: metadata?.embeddedAuthor,
				totalPages: metadata?.totalPages,
				thumbnailDataUrl: metadata?.thumbnailDataUrl
			});

			title = sanitized.title;
			author = sanitized.author ?? '';
			coverUrl = sanitized.thumbnailDataUrl ?? '';
			detectedTotalPages = sanitized.totalPages;

			await refreshDuplicateCheck();
		} finally {
			isAnalyzingFile = false;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		await submitForm(false);
	}

	async function submitForm(allowDuplicate: boolean) {
		if (!selectedFile) {
			error = 'Please select a PDF file to upload';
			return;
		}
		if (!title) {
			error = 'Please provide a title';
			return;
		}

		const duplicates = await refreshDuplicateCheck();
		if (!allowDuplicate && duplicates.exactDuplicates.length > 0) {
			showDuplicateConfirmation = true;
			return;
		}

		const formData: UploadFormData = {
			file: selectedFile,
			title,
			author: author || undefined,
			description: description || undefined,
			coverUrl: coverUrl || undefined,
			allowDuplicate: allowDuplicate || undefined
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

	async function refreshDuplicateCheck(): Promise<DuplicateCheckResult> {
		if (!selectedFile || !userId) {
			const emptyResult = {
				exactDuplicates: [],
				fuzzyDuplicates: []
			};
			duplicateCheck = emptyResult;
			return emptyResult;
		}

		try {
			const nextDuplicateCheck = await Effect.runPromise(
				checkDuplicateCandidates(userId, {
					title,
					author: author || undefined,
					totalPages: detectedTotalPages,
					fileHash: detectedFileHash
				})
			);
			duplicateCheck = nextDuplicateCheck;
			return nextDuplicateCheck;
		} catch (duplicateError) {
			console.error('Failed to check upload duplicates:', duplicateError);
			return duplicateCheck;
		}
	}

	function handleClose() {
		open = false;
		resetForm();
	}

	function removeSelectedFile() {
		selectedFile = null;
		detectedTotalPages = 1;
		detectedFileHash = undefined;
		duplicateCheck = {
			exactDuplicates: [],
			fuzzyDuplicates: []
		};
		showDuplicateConfirmation = false;
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

				{#if isAnalyzingFile}
					<p class="text-sm text-muted-foreground">
						Analyzing PDF metadata and checking for duplicates...
					</p>
				{/if}

				{#if duplicateCheck.fuzzyDuplicates.length > 0 && duplicateCheck.exactDuplicates.length === 0}
					<div class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
						<p class="font-medium">Possible duplicate found</p>
						<p class="mt-1">
							{duplicateCheck.fuzzyDuplicates[0].title}
							{#if duplicateCheck.fuzzyDuplicates[0].author}
								by {duplicateCheck.fuzzyDuplicates[0].author}
							{/if}
						</p>
					</div>
				{/if}

				{#if showDuplicateConfirmation && duplicateCheck.exactDuplicates.length > 0}
					<div class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
						<p class="font-semibold">Duplicate Upload Confirmation</p>
						<p class="mt-1">
							This upload looks identical to
							<strong>{duplicateCheck.exactDuplicates[0].title}</strong>.
						</p>
						<div class="mt-3 flex gap-2">
							<Button
								type="button"
								variant="outline"
								onclick={() => (showDuplicateConfirmation = false)}
							>
								Review Metadata
							</Button>
							<Button
								type="button"
								onclick={() => submitForm(true)}
								class="bg-red-600 text-white hover:bg-red-700"
							>
								Continue Anyway
							</Button>
						</div>
					</div>
				{/if}

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
					<Button
						type="submit"
						disabled={isUploading || isAnalyzingFile || !selectedFile}
						class="flex-1"
					>
						{#if isUploading}
							Uploading...
						{:else if isAnalyzingFile}
							Analyzing...
						{:else}
							Upload PDF
						{/if}
					</Button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
