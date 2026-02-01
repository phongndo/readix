<script lang="ts" module>
	import { cn } from '$lib/classnames.js';

	export interface InputProps {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		type?: 'text' | 'password' | 'email' | 'url' | 'number' | 'search' | 'tel';
		name?: string;
		id?: string;
		required?: boolean;
		error?: string;
		'aria-describedby'?: string;
		class?: string;
		oninput?: (value: string) => void;
		onchange?: (value: string) => void;
		onblur?: () => void;
		onfocus?: () => void;
	}
</script>

<script lang="ts">
	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		type = 'text',
		name,
		id,
		required = false,
		error,
		'aria-describedby': ariaDescribedBy,
		class: className,
		oninput,
		onchange,
		onblur,
		onfocus
	}: InputProps = $props();

	const describedByIds = $derived(
		[ariaDescribedBy, error && id ? `${id}-error` : undefined].filter(Boolean).join(' ') ||
			undefined
	);

	const inputClasses =
		'w-full rounded-md border border-neutral-700 bg-background px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50';

	const errorClasses = $derived(
		error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
	);
</script>

<input
	{id}
	{name}
	{type}
	{placeholder}
	{disabled}
	{required}
	bind:value
	class={cn(inputClasses, errorClasses, className)}
	aria-invalid={error ? 'true' : undefined}
	aria-describedby={describedByIds}
	oninput={(e: Event & { currentTarget: HTMLInputElement }) => {
		oninput?.(e.currentTarget.value);
	}}
	onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
		onchange?.(e.currentTarget.value);
	}}
	{onblur}
	{onfocus}
/>

{#if error}
	<p id={id ? `${id}-error` : undefined} class="mt-1 text-sm text-red-500">
		{error}
	</p>
{/if}
