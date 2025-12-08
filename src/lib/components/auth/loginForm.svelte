<script lang="ts">
  let email: string = '';
  let password: string = '';

</script>

<svelte:head>
  <title>Login</title>
</svelte:head>

<section class="flex flex-col min-h-screen justify-center items-center space-y-2">
  <h1 class="font-bold">Login</h1>
  <button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4">Login with Google</button>
  <button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4">Login with GitHub</button>
  <hr class="hr border-t-2" />
  <div>
    <input id="email" name="email" type="email" required class="text-gray-950" bind:value={email} placeholder="Email">
  </div>
  <div>
    <input id="password" name="password" type="password" required class="text-gray-950" bind:value={password} placeholder="Password">
  </div>
  <button type="submit" class="bg-primary-600 hover:bg-primary-800 text-white font-bold py-2 px-4">Login</button>
</section>

