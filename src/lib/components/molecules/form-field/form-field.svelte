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
		description?: string;
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
		description = '',
		rows = 3,
		class: className,
		oninput
	}: FormFieldProps = $props();

	// Generate unique IDs for ARIA attributes
	const inputId = $derived(name);
	const errorId = $derived(`${name}-error`);
	const descId = $derived(`${name}-description`);

	// Build aria-describedby value
	const ariaDescribedBy = $derived(
		[error ? errorId : null, description ? descId : null].filter(Boolean).join(' ') || undefined
	);
</script>

<div class={cn('grid gap-2', className)}>
	<Label for={inputId}>
		{label}
		{#if required}
			<span class="text-red-500" aria-hidden="true">*</span>
		{/if}
	</Label>

	{#if description}
		<p id={descId} class="text-xs text-muted-foreground">
			{description}
		</p>
	{/if}

	{#if type === 'textarea'}
		<textarea
			id={inputId}
			{name}
			{rows}
			{placeholder}
			{required}
			class={cn(
				'w-full resize-none rounded-md border bg-background px-3 py-2 text-sm',
				'focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500',
				'disabled:cursor-not-allowed disabled:opacity-50',
				error ? 'border-red-500' : 'border-neutral-700'
			)}
			value={String(value)}
			aria-invalid={error ? 'true' : 'false'}
			aria-describedby={ariaDescribedBy}
			oninput={(e: Event & { currentTarget: HTMLTextAreaElement }) =>
				oninput?.(e.currentTarget.value)}
		></textarea>
	{:else}
		<Input
			id={inputId}
			{name}
			type={type === 'number' ? 'text' : type}
			{placeholder}
			{required}
			value={String(value)}
			{error}
			aria-describedby={ariaDescribedBy}
			oninput={(v: string) => oninput?.(v)}
		/>
	{/if}

	{#if error}
		<p id={errorId} class="text-sm text-red-500" role="alert">
			{error}
		</p>
	{/if}
</div>
