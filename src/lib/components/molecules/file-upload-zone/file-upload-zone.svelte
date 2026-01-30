<script lang="ts" module>
	import { Upload, FileText } from '@lucide/svelte';
	import DropZone from '$lib/components/atoms/drop-zone/drop-zone.svelte';
	import FileInput from '$lib/components/atoms/file-input/file-input.svelte';

	export interface FileUploadZoneProps {
		onFileSelect: (file: File) => void;
		acceptedTypes?: string[];
		maxSizeMB?: number;
		class?: string;
	}

	const DEFAULT_ACCEPTED_TYPES = ['.pdf', '.epub', '.txt'];
</script>

<script lang="ts">
	let {
		onFileSelect,
		acceptedTypes = DEFAULT_ACCEPTED_TYPES,
		maxSizeMB = 50,
		class: className
	}: FileUploadZoneProps = $props();

	let isDragging = $state(false);
	let error = $state<string | null>(null);
	let fileInputRef: FileInput;

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			validateAndSelect(files[0]);
		}
	}

	function handleFileSelect(files: FileList) {
		if (files.length > 0) {
			validateAndSelect(files[0]);
		}
	}

	function validateAndSelect(file: File) {
		error = null;

		// Check file extension
		const ext = '.' + file.name.split('.').pop()?.toLowerCase();
		if (!acceptedTypes.includes(ext)) {
			error = `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
			return;
		}

		// Check file size
		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			error = `File too large. Maximum size: ${maxSizeMB}MB`;
			return;
		}

		onFileSelect(file);
	}

	function handleClick() {
		fileInputRef.click();
	}

	const acceptString = $derived(acceptedTypes.join(','));
</script>

<div class={className}>
	<DropZone
		{isDragging}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
	>
		<button type="button" onclick={handleClick} class="w-full">
			<div class="flex flex-col items-center gap-3">
				<div class="rounded-full bg-muted p-3">
					<Upload class="h-6 w-6 text-muted-foreground" />
				</div>
				<div>
					<p class="text-sm font-medium">Drop your file here, or click to browse</p>
					<p class="text-xs text-muted-foreground">
						PDF, EPUB, TXT up to {maxSizeMB}MB
					</p>
				</div>
				<div class="flex gap-4 text-xs text-muted-foreground">
					<div class="flex items-center gap-1">
						<FileText class="h-3 w-3" />
						<span>PDF</span>
					</div>
					<div class="flex items-center gap-1">
						<FileText class="h-3 w-3" />
						<span>EPUB</span>
					</div>
					<div class="flex items-center gap-1">
						<FileText class="h-3 w-3" />
						<span>TXT</span>
					</div>
				</div>
			</div>
		</button>
	</DropZone>

	<FileInput bind:this={fileInputRef} accept={acceptString} onSelect={handleFileSelect} />

	{#if error}
		<p class="mt-2 text-sm text-red-500">{error}</p>
	{/if}
</div>
