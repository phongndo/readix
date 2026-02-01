<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { AlertCircle, Home } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const status = $derived(page.status);
	const error = $derived(page.error);

	const title = $derived.by(() => {
		switch (status) {
			case 404:
				return 'Page Not Found';
			case 500:
				return 'Something Went Wrong';
			case 403:
				return 'Access Denied';
			default:
				return 'Error';
		}
	});

	const message = $derived.by(() => {
		if (error?.message) return error.message;

		switch (status) {
			case 404:
				return "The page you're looking for doesn't exist or has been moved.";
			case 500:
				return 'We encountered an unexpected error. Please try again later.';
			case 403:
				return "You don't have permission to access this page.";
			default:
				return 'An unexpected error occurred.';
		}
	});
</script>

<div class="flex h-screen flex-col items-center justify-center px-4">
	<div class="mb-6 rounded-full bg-muted p-6">
		<AlertCircle class="h-12 w-12 text-red-500" />
	</div>

	<h1 class="mb-2 text-3xl font-bold">{status}</h1>

	<h2 class="mb-2 text-xl font-semibold">{title}</h2>

	<p class="mb-8 max-w-md text-center text-muted-foreground">
		{message}
	</p>

	<Button variant="outline" href={resolve('/')}>
		<Home class="mr-2 h-4 w-4" />
		Go Home
	</Button>
</div>
