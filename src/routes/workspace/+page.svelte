<script lang="ts">
	import { UserButton } from 'svelte-clerk';
	import { BookOpen, ArrowLeft, Maximize2 } from '@lucide/svelte';
	import Button from '$lib/components/atoms/button/button.svelte';
</script>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<header class="border-b bg-card">
		<div class="container mx-auto flex h-14 items-center justify-between px-4">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" href="/">
					<ArrowLeft class="mr-2 h-4 w-4" />
					Back
				</Button>
				<div class="flex items-center gap-2">
					<BookOpen class="h-5 w-5" />
					<span class="font-semibold">Workspace</span>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<Button variant="ghost" size="icon">
					<Maximize2 class="h-4 w-4" />
				</Button>
				<UserButton />
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-6xl">
			<!-- Workspace Header -->
			<div class="mb-6 rounded-lg border bg-card p-6">
				<h1 class="text-2xl font-bold">Reading Workspace</h1>
				<p class="text-muted-foreground">Your premium reading environment</p>
			</div>

			<!-- Placeholder for workspace content -->
			<div class="rounded-lg border bg-card p-8 text-center">
				<p class="mb-4 text-muted-foreground">Select a book to start reading</p>
				<Button href="/library">Browse Library</Button>
			</div>
		</div>
	</main>
</div>
