<script lang="ts">
	import { SignedIn, SignedOut, RedirectToSignIn } from 'svelte-clerk';
</script>

<SignedOut>
	<RedirectToSignIn />
</SignedOut>
<SignedIn>
	<h1>Your Library</h1>
	<!-- Library content here -->
</SignedIn>
