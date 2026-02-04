<script lang="ts">
	import { X } from '@lucide/svelte';
	import { toastState } from '$lib/state/toastState.svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const { toasts } = toastState;

	const typeStyles: Record<string, string> = {
		success: 'border-green-500/30 bg-green-500/10 text-green-400',
		error: 'border-red-500/30 bg-red-500/10 text-red-400',
		info: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
	};

	const typeIcons: Record<string, string> = {
		success: '✓',
		error: '✕',
		info: 'ℹ'
	};
</script>

<div
	class="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
	role="region"
	aria-label="Notifications"
>
	{#each toasts as toast (toast.id)}
		<div
			class="flex min-w-[300px] max-w-[400px] items-center gap-3 rounded-md border px-4 py-3 shadow-lg {typeStyles[
				toast.type
			]}"
			role="alert"
		>
			<span class="flex h-5 w-5 shrink-0 items-center justify-center text-sm font-bold">
				{typeIcons[toast.type]}
			</span>

			<p class="flex-1 text-sm">{toast.message}</p>

			<Button
				variant="ghost"
				size="icon-sm"
				onclick={() => toastState.dismiss(toast.id)}
				class="h-6 w-6 shrink-0 text-current opacity-60 hover:opacity-100"
				aria-label="Dismiss notification"
			>
				<X class="h-3 w-3" />
			</Button>
		</div>
	{/each}
</div>
