<script lang="ts" module>
	import { cn } from '$lib/classnames.js';

	export interface FormFieldProps {
		label: string;
		name: string;
		type?: 'text' | 'textarea' | 'password' | 'email' | 'number';
		value: string | number;
		placeholder?: string;
		required?: boolean;
		error?: string;
		rows?: number;
		class?: string;
		oninput?: (value: string) => void;
	}
</script>

<script lang="ts">
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	let {
		label,
		name,
		type = 'text',
		value,
		placeholder = '',
		required = false,
		error = '',
		rows = 3,
		class: className,
		oninput
	}: FormFieldProps = $props();
</script>

<div class={cn('grid gap-2', className)}>
	<Label for={name}>
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</Label>

	{#if type === 'textarea'}
		<textarea
			id={name}
			{name}
			{rows}
			{placeholder}
			{required}
			class="w-full resize-none rounded-md border border-neutral-700 bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
			{value}
			oninput={(e: Event & { currentTarget: HTMLTextAreaElement }) =>
				oninput?.(e.currentTarget.value)}
		></textarea>
	{:else}
		<Input
			id={name}
			{name}
			type={type === 'number' ? 'text' : type}
			{placeholder}
			{required}
			value={String(value)}
			{error}
			oninput={(v: string) => oninput?.(v)}
		/>
	{/if}
</div>
