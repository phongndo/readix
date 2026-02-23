<script lang="ts" module>
	import { ChevronLeft, Search, PanelLeft, BookMarked } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Tooltip from '$lib/components/ui/tooltip/tooltip.svelte';
	import ZoomToolbar from '../zoom-toolbar/zoom-toolbar.svelte';

	export interface ReaderToolbarProps {
		title: string;
		author: string;
		currentPage: number;
		totalPages: number;
		onBack: () => void;
		onToggleSidebar: () => void;
		onSearchClick: () => void;
		onAddBookmark: () => void;
		zoom: number;
		onZoomChange: (zoom: number) => void;
		isSidebarOpen?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	let {
		title,
		author,
		currentPage,
		totalPages,
		onBack,
		onToggleSidebar,
		onSearchClick,
		onAddBookmark,
		zoom,
		onZoomChange,
		isSidebarOpen = false,
		class: className
	}: ReaderToolbarProps = $props();
</script>

<header class="flex items-center justify-between border-b bg-background py-3 px-4 {className}">
	<!-- Left: Back button and book info -->
	<div class="flex items-center gap-3 min-w-0 flex-1">
		<Tooltip content="Back to library" position="bottom">
			{#snippet children({ props })}
				<Button {...props} variant="ghost" size="sm" onclick={onBack} class="shrink-0">
					<ChevronLeft class="mr-1 h-4 w-4" />
					<span>Back</span>
				</Button>
			{/snippet}
		</Tooltip>

		<div class="min-w-0">
			<h1 class="truncate font-semibold text-sm" {title}>
				{title}
			</h1>
			<p class="truncate text-xs text-muted-foreground" title={author}>
				{author}
			</p>
		</div>
	</div>

	<!-- Center: Page indicator -->
	<div class="hidden md:flex items-center justify-center px-4">
		<span class="text-sm text-muted-foreground whitespace-nowrap">
			Page {currentPage} of {totalPages}
		</span>
	</div>

	<!-- Right: Zoom controls, Search, Sidebar toggle -->
	<div class="flex items-center gap-2 shrink-0">
		<ZoomToolbar currentZoom={zoom} {onZoomChange} />

		<div class="mx-2 h-4 w-px bg-border hidden sm:block"></div>

		<Tooltip content="Add bookmark" position="bottom">
			{#snippet children({ props })}
				<Button
					{...props}
					variant="ghost"
					size="icon-sm"
					onclick={onAddBookmark}
					aria-label="Add bookmark"
					class="hidden sm:flex"
				>
					<BookMarked class="h-4 w-4" />
				</Button>
			{/snippet}
		</Tooltip>

		<Tooltip content="Search" position="bottom">
			{#snippet children({ props })}
				<Button
					{...props}
					variant="ghost"
					size="icon-sm"
					onclick={onSearchClick}
					aria-label="Search"
				>
					<Search class="h-4 w-4" />
				</Button>
			{/snippet}
		</Tooltip>

		<Tooltip content="Toggle sidebar" position="bottom">
			{#snippet children({ props })}
				<Button
					{...props}
					variant={isSidebarOpen ? 'secondary' : 'ghost'}
					size="icon-sm"
					onclick={onToggleSidebar}
					aria-label="Toggle sidebar"
					aria-pressed={isSidebarOpen}
				>
					<PanelLeft class="h-4 w-4" />
				</Button>
			{/snippet}
		</Tooltip>
	</div>
</header>

<!-- Progress bar -->
<div class="h-1 w-full bg-muted">
	<div
		class="h-full bg-primary transition-all duration-300"
		style="width: {totalPages > 0 ? (currentPage / totalPages) * 100 : 0}%"
	></div>
</div>
