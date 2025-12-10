<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		form?: {
			errors?: {
				firstname?: string[];
				lastname?: string[];
				email?: string[];
				password?: string[];
				form?: string[];
			};
			firstname?: string;
			lastname?: string;
			email?: string;
		} | null;
	}

	let { form = null }: Props = $props();
</script>

<svelte:head>
	<title>Sign up</title>
</svelte:head>
<section class="flex flex-col min-h-screen justify-center items-center space-y-2">
	<h1 class="font-bold">Enjoy reading</h1>

	<form method="POST" use:enhance class="flex flex-col space-y-2">
		{#if form?.errors?.form}
			<p class="text-red-500">{form.errors.form[0]}</p>
		{/if}
		<div>
			<input
				name="firstname"
				type="text"
				required
				class="text-gray-950"
				value={form?.firstname ?? ''}
				placeholder="First name"
			/>
			{#if form?.errors?.firstname}
				<p class="text-red-500 text-sm">{form.errors.firstname[0]}</p>
			{/if}
		</div>
		<div>
			<input
				name="lastname"
				type="text"
				required
				class="text-gray-950"
				value={form?.lastname ?? ''}
				placeholder="Last name"
			/>
			{#if form?.errors?.lastname}
				<p class="text-red-500 text-sm">{form.errors.lastname[0]}</p>
			{/if}
		</div>
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
		<button
			type="submit"
			class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4"
		>
			Sign up
		</button>
	</form>
</section>
