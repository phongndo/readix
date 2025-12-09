<script lang="ts">
	import { useSelectionCapability, type SelectionRangeX } from '@embedpdf/plugin-selection/svelte';

	const selection = useSelectionCapability();
	let hasSelection = $state(false);

	$effect(() => {
		if (!selection.provides) return;

		const unsubscribe = selection.provides.onSelectionChange((sel: SelectionRangeX | null) => {
			hasSelection = !!sel;
		});

		return () => unsubscribe?.();
	});
</script>

<button
	type="button"
	onclick={() => selection.provides?.copyToClipboard()}
	disabled={!hasSelection}
>
	Copy
</button>
