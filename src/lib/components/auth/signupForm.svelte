<script lang="ts">
	import { supabase } from '$lib/supabase/client';
	import { goto } from '$app/navigation';

  let firstname: string = '';
  let lastname: string = '';
	let email: string = '';
	let password: string = '';
	let loading: boolean = false;
	let error: string | null = null;
</script>

<svelte:head>
	<title>Sign up</title>
</svelte:head>


<section class="flex flex-col min-h-screen justify-center items-center space-y-2">
	<h1 class="font-bold">Enjoy reading</h1>
	<button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4"
		>Sign up with Google</button
	>
	<button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4"
		>Sign up with GitHub</button
	>
	<hr class="hr border-t-2" />
  <div>
    <input 
      id="firstname"
      name="firstname"
      type="text"
      required
      class=" text-gray-950"
      bind:value={firstname}
      placeholder="First name"
    />
  </div>
  <div>
    <input 
      id="lastname"
      name="lastname"
      type="text"   
      required
      class=" text-gray-950"
      bind:value={lastname}
      placeholder="Last name" />
  </div>
	<div>
		<input
			id="email"
			name="email"
			type="email"
			required
			class="text-gray-950"
			bind:value={email}
			placeholder="Email"
		/>
	</div>
	<div>
		<input
			id="password"
			name="password"
			type="password"
			required
			class="text-gray-950"
			bind:value={password}
			placeholder="Password"
		/>
	</div>
	<button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4"
		>Login</button
	>
</section>
