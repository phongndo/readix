<script lang="ts">
	import SignupForm from '$features/auth/ui/SignupForm.svelte';
  export let form;
</script>

<main>
	<div class="flex flex-col min-h-screen justify-center items-center space-y-8">
		<SignupForm {form}/>
	</div>
</main>
