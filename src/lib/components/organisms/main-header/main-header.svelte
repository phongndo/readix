<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { UserButton } from 'svelte-clerk/client';
	import { BookOpen, Monitor, User } from '@lucide/svelte';
	import { cn } from '$lib/classnames.js';

	let pathname = $derived(page.url.pathname);
	let isReader = $derived(pathname.startsWith('/reader'));

	const navItems = [
		{ href: '/library', label: 'Library', icon: BookOpen },
		{ href: '/workspace', label: 'Workspace', icon: Monitor },
		{ href: '/profile', label: 'Profile', icon: User }
	] as const;
</script>

{#if !isReader}
	<header
		class="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container mx-auto flex h-14 items-center justify-between px-4">
			<!-- Logo -->
			<a href={resolve('/')} class="flex items-center gap-2 font-semibold">
				<BookOpen class="h-5 w-5" />
				<span>Readix</span>
			</a>

			<!-- Navigation -->
			<nav class="hidden items-center gap-1 sm:flex">
				{#each navItems as item (item.href)}
					{@const isActive = pathname === item.href}
					<a
						href={resolve(item.href)}
						class={cn(
							'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors relative',
							isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
						)}
					>
						<item.icon class="h-5 w-5" />
						<span>{item.label}</span>
						{#if isActive}
							<span class="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"></span>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- Mobile nav -->
			<nav class="flex items-center gap-1 sm:hidden">
				{#each navItems as item (item.href)}
					{@const isActive = pathname === item.href}
					<a
						href={resolve(item.href)}
						class={cn(
							'p-2 transition-colors',
							isActive ? 'text-foreground' : 'text-muted-foreground'
						)}
					>
						<item.icon class="h-5 w-5" />
					</a>
				{/each}
			</nav>

			<!-- Right side -->
			<div class="flex items-center gap-2">
				<UserButton />
			</div>
		</div>
	</header>
{/if}
