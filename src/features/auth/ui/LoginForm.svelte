<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

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

<section class="box-border flex flex-col min-h-screen justify-center items-center space-y-2">
	<p class="font-bold text-4xl text-center">Welcome back</p>
  <p class="text-center">Sign in to continue reading</p>

	<form method="POST" use:enhance class="mt-4 flex flex-col space-y-2">
		{#if form?.errors?.form}
			<p class="text-red-500">{form.errors.form[0]}</p>
		{/if}
		<div>
      <p>Email</p>
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
      <p>Password</p>
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
		<button
			type="submit"
			class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4"
		>
			Login
		</button>
	</form>
	<!-- Create if no account sign up -->
	<p class="mt-4 text-center max-w-md">Don't have an account? <span> <a href={resolve('/auth/signup')} class="text-primary-600 hover:underline">Sign Up</a></span></p>
</section>
