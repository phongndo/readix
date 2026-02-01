<script lang="ts" module>
	import { SearchX } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	export interface EmptySearchStateProps {
		searchQuery: string;
		onClear: () => void;
		class?: string;
	}
</script>

<script lang="ts">
	let { searchQuery, onClear, class: className }: EmptySearchStateProps = $props();
</script>

<div class="flex flex-col items-center gap-4 py-12 text-center {className}">
	<div class="rounded-full bg-muted p-4">
		<SearchX class="h-8 w-8 text-muted-foreground" />
	</div>
	<div>
		<h3 class="text-lg font-semibold">No books found</h3>
		<p class="text-muted-foreground">
			No results for "{searchQuery}". Try a different search term.
		</p>
	</div>
	<Button variant="outline" onclick={onClear}>Clear Search</Button>
</div>
