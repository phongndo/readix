<script lang="ts" module>
	import { format, subDays, startOfWeek, addDays, isSameDay, getMonth } from 'date-fns';
	import CardContainer from '$lib/components/atoms/card-container/card-container.svelte';

	export interface ContributionCalendarProps {
		activity: Array<{ date: Date; pages: number }>;
		class?: string;
	}
</script>

<script lang="ts">
	let { activity = [], class: className }: ContributionCalendarProps = $props();

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

	const monthNames = [
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

	// Generate month labels aligned with weeks
	const monthLabels = $derived(
		weeks.map((week, index) => {
			const firstDayOfWeek = week[0];
			const month = getMonth(firstDayOfWeek);
			// Only show month label if it's the first week of the month or first week
			if (index === 0 || getMonth(weeks[index - 1][0]) !== month) {
				return { label: monthNames[month], show: true };
			}
			return { label: '', show: false };
		})
	);
</script>

<CardContainer padding="lg" class={className}>
	<h3 class="mb-4 text-lg font-semibold">Reading Activity</h3>

	<!-- Legend -->
	<div class="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
		<span>Less</span>
		<div class="flex gap-1">
			{#each levelClasses as cls, index (index)}
				<div class="h-3 w-3 rounded-sm {cls}"></div>
			{/each}
		</div>
		<span>More</span>
	</div>

	<!-- Calendar Container -->
	<div class="w-full overflow-x-auto">
		<div class="mx-auto flex flex-col items-center gap-1 min-w-max">
			<!-- Month labels row -->
			<div class="flex gap-[3px] text-xs text-muted-foreground w-full">
				<div class="w-6 flex-shrink-0"></div>
				{#each monthLabels as { label, show }, i (i)}
					<div class="flex-1 min-w-[12px] text-center" style="flex-basis: {show ? 'auto' : '0'}">
						{#if show}
							{label}
						{/if}
					</div>
				{/each}
			</div>

			<!-- Main grid with day labels -->
			<div class="flex gap-[3px]">
				<!-- Day labels column -->
				<div class="flex flex-col gap-[3px] text-xs text-muted-foreground pr-1">
					<div class="h-3"></div>
					<div class="h-3 leading-3">Mon</div>
					<div class="h-3"></div>
					<div class="h-3 leading-3">Wed</div>
					<div class="h-3"></div>
					<div class="h-3 leading-3">Fri</div>
					<div class="h-3"></div>
				</div>

				<!-- Calendar grid -->
				<div class="flex gap-[3px]">
					{#each weeks as week, weekIndex (weekIndex)}
						<div class="flex flex-col gap-[3px]">
							{#each week as day, dayIndex (`${weekIndex}-${dayIndex}`)}
								{@const level = getActivityLevel(day)}
								<div
									class="h-[10px] w-[10px] rounded-sm {levelClasses[
										level
									]} transition-colors hover:ring-2 hover:ring-primary/50"
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
</CardContainer>
