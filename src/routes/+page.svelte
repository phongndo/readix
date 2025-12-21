<script lang="ts">
  import { SignedIn, SignedOut, SignInButton, UserButton } from "svelte-clerk";
</script>

<main class="grid min-h-screen place-items-center gap-3">
  <h1 class="text-center">Welcome to Readix</h1>

  <SignedOut>
    <SignInButton mode="redirect" />
  </SignedOut>

  <SignedIn>
    <UserButton />
  </SignedIn>
</main>
