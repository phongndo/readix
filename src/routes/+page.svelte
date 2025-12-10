<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Readix</title>
	<meta
		name="description"
		content="A performance-focused reading platform engineered for comprehension mastery."
	/>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<main>
	<div class="flex flex-col min-h-screen justify-center items-center space-y-4">
		<h1 class="font-bold text-4xl">
			Welcome to <span class="font-bold text-primary-600">Readix</span>
		</h1>
		<p class="mt-4 text-lg text-center max-w-md">A pdf reading platform</p>
		<a href={resolve('/dashboard')} class="bg-primary-600 hover:bg-primary-800 font-bold py-2 px-4">
			Start your journey
		</a>
	</div>
</main>
