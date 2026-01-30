<script lang="ts">
	import { BookOpen, Upload, FileText } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let { onUpload }: { onUpload: () => void } = $props();
</script>

<div class="rounded-lg border bg-card p-8 text-center">
	<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
		<BookOpen class="h-10 w-10 text-primary" />
	</div>

	<h3 class="mb-2 text-xl font-semibold">Start Your Reading Journey</h3>
	<p class="mx-auto mb-6 max-w-md text-muted-foreground">
		Your library is empty. Upload PDFs, EPUBs, or paste text to begin tracking your reading progress
		and building your streak.
	</p>

	<div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
		<Button size="lg" onclick={onUpload}>
			<Upload class="mr-2 h-4 w-4" />
			Upload Book
		</Button>
	</div>

	<div class="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
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
