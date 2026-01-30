<script lang="ts">
	import { Award, PartyPopper } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	let {
		newAchievements = [] as string[],
		open = $bindable(false)
	}: {
		newAchievements: string[];
		open: boolean;
	} = $props();
</script>

{#if open && newAchievements.length > 0}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
			<div class="flex items-center justify-center mb-4">
				<div class="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
					<PartyPopper class="h-8 w-8 text-yellow-600" />
				</div>
			</div>

			<h2 class="text-center text-xl font-bold mb-2">Achievement Unlocked!</h2>
			<p class="text-center text-sm text-muted-foreground mb-6">
				Congratulations! You've earned new achievements:
			</p>

			<div class="space-y-2 mb-6">
				{#each newAchievements as achievement, index (index)}
					<div class="flex items-center gap-3 rounded-md bg-primary/10 p-3">
						<Award class="h-5 w-5 text-primary" />
						<span class="font-medium">{achievement}</span>
					</div>
				{/each}
			</div>

			<Button class="w-full" onclick={() => (open = false)}>Awesome!</Button>
		</div>
	</div>
{/if}
