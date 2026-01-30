<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	export interface FormFieldProps {
		label: string;
		name: string;
		type?: 'text' | 'textarea';
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

	const inputClasses =
		'w-full rounded-md border border-neutral-700 bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500';
</script>

<div class={cn('grid gap-2', className)}>
	<label for={name} class="text-sm font-medium">
		{label}
		{#if required}
			<span class="text-red-500">*</span>
		{/if}
	</label>

	{#if type === 'textarea'}
		<textarea
			id={name}
			{name}
			{rows}
			{placeholder}
			{required}
			class={cn(inputClasses, 'resize-none')}
			{value}
			oninput={(e) => oninput?.(e.currentTarget.value)}
		></textarea>
	{:else}
		<input
			id={name}
			{name}
			type="text"
			{placeholder}
			{required}
			class={inputClasses}
			{value}
			oninput={(e) => oninput?.(e.currentTarget.value)}
		/>
	{/if}

	{#if error}
		<p class="text-sm text-red-500">{error}</p>
	{/if}
</div>
