<script lang="ts">
	import { format, subDays, startOfWeek, addDays, isSameDay } from 'date-fns';

	let { activity = [] }: { activity: Array<{ date: Date; pages: number }> } = $props();

	// Generate 52 weeks of dates
	const today = new Date();
	const weeks: Date[][] = [];
	let currentWeek: Date[] = [];

	// Start from 52 weeks ago
	const startDate = subDays(today, 52 * 7);
	const firstSunday = startOfWeek(startDate, { weekStartsOn: 0 });

	for (let i = 0; i < 52 * 7; i++) {
		const date = addDays(firstSunday, i);
		currentWeek.push(date);

		if (currentWeek.length === 7) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
	}

	function getActivityLevel(date: Date): number {
		const dayActivity = activity.find((a) => isSameDay(a.date, date));
		if (!dayActivity || dayActivity.pages === 0) return 0;
		if (dayActivity.pages < 20) return 1;
		if (dayActivity.pages < 50) return 2;
		if (dayActivity.pages < 100) return 3;
		return 4;
	}

	const levelClasses = [
		'bg-muted',
		'bg-primary/20',
		'bg-primary/40',
		'bg-primary/60',
		'bg-primary'
	];

	const monthLabels = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
</script>

<div class="rounded-lg border bg-card p-6">
	<h3 class="mb-4 text-lg font-semibold">Reading Activity</h3>

	<div class="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
		<span>Less</span>
		<div class="flex gap-1">
			{#each levelClasses as cls, index (index)}
				<div class="h-3 w-3 rounded-sm {cls}"></div>
			{/each}
		</div>
		<span>More</span>
	</div>

	<div class="overflow-x-auto">
		<div class="inline-flex flex-col gap-1">
			<!-- Month labels -->
			<div class="flex gap-1 text-xs text-muted-foreground">
				<div class="w-8"></div>
				{#each monthLabels as month, i (i)}
					{#if i % 2 === 0}
						<div class="w-7">{month}</div>
					{:else}
						<div class="w-7"></div>
					{/if}
				{/each}
			</div>

			<div class="flex gap-1">
				<!-- Day labels -->
				<div class="flex flex-col gap-1 text-xs text-muted-foreground">
					<div class="h-3"></div>
					<div class="h-3">Mon</div>
					<div class="h-3"></div>
					<div class="h-3">Wed</div>
					<div class="h-3"></div>
					<div class="h-3">Fri</div>
					<div class="h-3"></div>
				</div>

				<!-- Calendar grid -->
				{#each weeks as week, weekIndex (weekIndex)}
					<div class="flex flex-col gap-1">
						{#each week as day, dayIndex (`${weekIndex}-${dayIndex}`)}
							{@const level = getActivityLevel(day)}
							<div
								class="h-3 w-3 rounded-sm {levelClasses[level]}"
								title="{format(day, 'MMM d, yyyy')}: {activity.find((a) => isSameDay(a.date, day))
									?.pages || 0} pages"
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
