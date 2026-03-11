<script lang="ts">
	import { BookOpen, Clock3, Sparkles } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import BookGrid from '$lib/components/organisms/book-grid/book-grid.svelte';
	import type { Book } from '$lib/domain/book/Book';
	import type { WorkspaceOverview } from '$lib/services/readingOverviewService';

	let {
		data
	}: {
		data: WorkspaceOverview;
	} = $props();

	const books = $derived(data.books ?? []);
	const inProgressBooks = $derived(
		books
			.filter((book) => !book.isCompleted)
			.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
	);
	const continueReadingBook = $derived(inProgressBooks[0] ?? null);
	const totalPagesRemaining = $derived(
		inProgressBooks.reduce(
			(total, book) => total + Math.max(0, book.totalPages - book.currentPage),
			0
		)
	);

	function openReader(book: Book) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/reader/${book.id}`);
	}

	function openContinueReading() {
		if (!continueReadingBook) {
			return;
		}

		openReader(continueReadingBook);
	}
</script>

<div class="min-h-screen bg-background">
	<main class="container mx-auto max-w-6xl px-4 py-8">
		<div class="mb-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
			<div class="rounded-xl border bg-card p-6">
				<div class="mb-4 flex items-center gap-3">
					<div class="rounded-full bg-primary/10 p-3">
						<Sparkles class="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 class="text-2xl font-bold">Workspace</h1>
						<p class="text-sm text-muted-foreground">
							Pick up where you left off and keep your reading queue moving.
						</p>
					</div>
				</div>

				{#if continueReadingBook}
					<div class="rounded-lg border bg-muted/40 p-4">
						<p class="text-xs uppercase tracking-wide text-muted-foreground">Continue reading</p>
						<h2 class="mt-2 text-xl font-semibold">{continueReadingBook.title}</h2>
						<p class="text-sm text-muted-foreground">
							{continueReadingBook.currentPage} / {continueReadingBook.totalPages} pages
						</p>
						<div class="mt-4 flex gap-3">
							<Button onclick={openContinueReading}>Open Reader</Button>
							<Button variant="outline" href={resolve('/library')}>Browse Library</Button>
						</div>
					</div>
				{:else}
					<div class="rounded-lg border bg-muted/40 p-4">
						<p class="text-sm text-muted-foreground">
							No active reading sessions yet. Start from your library to build a queue here.
						</p>
						<div class="mt-4">
							<Button href={resolve('/library')}>Browse Library</Button>
						</div>
					</div>
				{/if}
			</div>

			<div class="grid gap-4">
				<div class="rounded-xl border bg-card p-4">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-blue-500/10 p-2">
							<BookOpen class="h-4 w-4 text-blue-500" />
						</div>
						<div>
							<p class="text-2xl font-semibold">{inProgressBooks.length}</p>
							<p class="text-xs text-muted-foreground">Books in progress</p>
						</div>
					</div>
				</div>
				<div class="rounded-xl border bg-card p-4">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-amber-500/10 p-2">
							<Clock3 class="h-4 w-4 text-amber-500" />
						</div>
						<div>
							<p class="text-2xl font-semibold">{totalPagesRemaining}</p>
							<p class="text-xs text-muted-foreground">Pages remaining</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<BookGrid
			books={inProgressBooks}
			onBookClick={openReader}
			emptyState={{
				title: 'No active books',
				description: 'Books you are currently reading will appear here.'
			}}
		/>
	</main>
</div>
