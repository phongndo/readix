<script lang="ts">
	import { Maximize2 } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="min-h-screen bg-background">
	<!-- Main Content -->
	<main class="container mx-auto px-4 py-8">
		<div class="mx-auto max-w-6xl">
			<!-- Workspace Header -->
			<div class="mb-6 flex items-center justify-between rounded-lg border bg-card p-6">
				<div>
					<h1 class="text-2xl font-bold">Reading Workspace</h1>
					<p class="text-muted-foreground">Your premium reading environment</p>
				</div>
				<Button variant="ghost" size="icon">
					<Maximize2 class="h-4 w-4" />
				</Button>
			</div>

			<!-- Placeholder for workspace content -->
			<div class="rounded-lg border bg-card p-8 text-center">
				<p class="mb-4 text-muted-foreground">Select a book to start reading</p>
				<Button href="/library">Browse Library</Button>
			</div>
		</div>
	</main>
</div>
