<script lang="ts">
	import { Award } from '@lucide/svelte';

	let {
		achievements = [] as Array<{
			name: string;
			description: string;
			icon: string;
			unlockedAt: Date;
		}>
	}: {
		achievements: Array<{ name: string; description: string; icon: string; unlockedAt: Date }>;
	} = $props();
</script>

<div class="rounded-lg border bg-card">
	<div class="border-b p-4">
		<h3 class="font-semibold">Achievements</h3>
	</div>
	<div class="p-4">
		{#if achievements.length === 0}
			<p class="text-sm text-muted-foreground">No achievements yet. Keep reading!</p>
		{:else}
			<div class="grid gap-3">
				{#each achievements as achievement (achievement.name)}
					<div class="flex items-start gap-3 rounded-md bg-muted/50 p-3">
						<div class="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
							<Award class="h-4 w-4 text-yellow-600" />
						</div>
						<div class="flex-1">
							<p class="font-medium">{achievement.name}</p>
							<p class="text-xs text-muted-foreground">{achievement.description}</p>
							<p class="mt-1 text-xs text-muted-foreground">
								Unlocked {achievement.unlockedAt.toLocaleDateString()}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
