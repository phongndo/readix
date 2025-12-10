<script lang="ts">
  import { enhance } from '$app/forms';
  
  interface Props {
    form?: {
      errors?: { email?: string[]; password?: string[]; form?: string[] };
      email?: string;
    } | null;
  }
  
  let { form = null }: Props = $props();
</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<section class="flex flex-col min-h-screen justify-center items-center space-y-2">
  <h1 class="font-bold text-2xl">Enjoy reading</h1>
  
  <form method="POST" use:enhance class="flex flex-col space-y-2">
    {#if form?.errors?.form}
      <p class="text-red-500">{form.errors.form[0]}</p>
    {/if}
    <div>
      <input
        name="email"
        type="email"
        required
        class="text-gray-950"
        value={form?.email ?? ''}
        placeholder="Email"
      />
      {#if form?.errors?.email}
        <p class="text-red-500 text-sm">{form.errors.email[0]}</p>
      {/if}
    </div>
    <div>
      <input
        name="password"
        type="password"
        required
        class="text-gray-950"
        placeholder="Password"
      />
      {#if form?.errors?.password}
        <p class="text-red-500 text-sm">{form.errors.password[0]}</p>
      {/if}
    </div>
    <button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4">
      Login
    </button>
  </form>
  <!-- Create if no account sign up -->
  <h2 class="font-bold text-2xl">Join Readix</h2>
  <p class="mt-2 text-lg text-center max-w-md">Sign up to start your reading journey!</p>
  <button
    type="button"
    class="bg-primary-600 hover:bg-primary-800 font-bold py-2 px-4"
  >
    Sign Up
  </button>
</section>

 
