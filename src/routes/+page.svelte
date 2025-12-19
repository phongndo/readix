<script lang="ts">
	import { SignedIn, SignedOut, SignInButton, UserButton } from 'svelte-clerk';
</script>

<SignedOut>
	<SignInButton mode="redirect" />
</SignedOut>
<SignedIn>
	<UserButton />
</SignedIn>
