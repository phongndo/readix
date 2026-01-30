<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'inline-flex shrink-0 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
		variants: {
			variant: {
				primary: 'bg-red-500 text-white hover:bg-red-600',
				secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
				outline: 'border border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800',
				ghost: 'bg-transparent text-neutral-100 hover:bg-red-500/10 hover:text-red-500',
				destructive: 'bg-red-600 text-white hover:bg-red-700'
			},
			size: {
				sm: 'h-8 px-3 text-xs',
				md: 'h-10 px-4',
				lg: 'h-12 px-6 text-base',
				icon: 'h-9 w-9 p-0',
				'icon-sm': 'h-8 w-8 p-0',
				'icon-lg': 'h-10 w-10 p-0'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'primary',
		size = 'md',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
