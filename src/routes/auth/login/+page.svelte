<script lang="ts">
	import LoginForm from '$features/auth/ui/LoginForm.svelte';
	export let form;
</script>

<main>
	<div class="flex flex-col min-h-screen justify-center items-center space-y-8">
		<LoginForm {form} />
	</div>
</main>
