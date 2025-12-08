<script lang="ts">
import { goto } from '$app/navigation';

  function navigateToDashboard() {
    goto('/dashboard');
  }
</script>

<svelte:head>
  <title>Readix</title>
  <meta name="description" content="A performance-focused reading platform engineered for comprehension mastery." />
  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<main>
  <div class="flex flex-col min-h-screen justify-center items-center space-y-8">
    <h1 class="font-bold text-4xl">Welcome to <span class="font-bold text-orange-500">Readix</span></h1>
    <p class="mt-4 text-lg text-center max-w-md">
      A performance-focused reading platform engineered for comprehension mastery. 
    </p>
    <button type="button" class="bg-orange-500 hover:bg-orange-700 text-white fond-bold py-2 px-4" on:click={navigateToDashboard}>
      Start your journey 
    </button>
  </div>
</main>
