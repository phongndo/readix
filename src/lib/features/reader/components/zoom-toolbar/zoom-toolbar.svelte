<script lang="ts" module>
	import { ZoomIn, ZoomOut } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';

	export interface ZoomToolbarProps {
		currentZoom: number;
		onZoomChange: (zoom: number) => void;
		class?: string;
	}

	const ZOOM_PRESETS = [
		{ label: '50%', value: 0.5 },
		{ label: '100%', value: 1.0 },
		{ label: '150%', value: 1.5 },
		{ label: '200%', value: 2.0 },
		{ label: 'Fit Width', value: -1 },
		{ label: 'Fit Page', value: -2 }
	] as const;
</script>

<script lang="ts">
	let { currentZoom, onZoomChange, class: className }: ZoomToolbarProps = $props();

	let showPresets = $state(false);

	function handleZoomOut() {
		const newZoom = Math.max(0.25, currentZoom - 0.25);
		onZoomChange(newZoom);
	}

	function handleZoomIn() {
		const newZoom = Math.min(4.0, currentZoom + 0.25);
		onZoomChange(newZoom);
	}

	function handlePresetChange(value: number) {
		onZoomChange(value);
		showPresets = false;
	}

	function formatZoomLevel(): string {
		return `${Math.round(currentZoom * 100)}%`;
	}

	function togglePresets() {
		showPresets = !showPresets;
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.zoom-presets-dropdown')) {
			showPresets = false;
		}
	}

	$effect(() => {
		if (showPresets) {
			document.addEventListener('click', handleClickOutside);
		} else {
			document.removeEventListener('click', handleClickOutside);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="flex items-center gap-2 {className}">
	<Tooltip content="Zoom out (-)" position="bottom">
		{#snippet children({ props })}
			<Button
				{...props}
				variant="ghost"
				size="icon-sm"
				onclick={handleZoomOut}
				aria-label="Zoom out"
			>
				<ZoomOut class="h-4 w-4" />
			</Button>
		{/snippet}
	</Tooltip>

	<div class="relative zoom-presets-dropdown">
		<Tooltip content="Zoom level" position="bottom">
			{#snippet children({ props })}
				<button
					{...props}
					onclick={togglePresets}
					class="flex h-8 min-w-[72px] items-center justify-center rounded-md px-2 text-sm font-medium hover:bg-accent"
				>
					<span>{formatZoomLevel()}</span>
				</button>
			{/snippet}
		</Tooltip>

		{#if showPresets}
			<div class="absolute top-full right-0 z-50 mt-1 w-40 rounded-md border bg-popover shadow-md">
				{#each ZOOM_PRESETS as preset (preset.label)}
					<button
						onclick={() => handlePresetChange(preset.value)}
						class="w-full px-3 py-2 text-left text-sm hover:bg-accent first:rounded-t-md last:rounded-b-md"
					>
						{preset.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<Tooltip content="Zoom in (+)" position="bottom">
		{#snippet children({ props })}
			<Button {...props} variant="ghost" size="icon-sm" onclick={handleZoomIn} aria-label="Zoom in">
				<ZoomIn class="h-4 w-4" />
			</Button>
		{/snippet}
	</Tooltip>
</div>
