<script lang="ts" module>
	import { format, subDays, startOfWeek, addDays, isSameDay, getMonth, getDate } from 'date-fns';
	import CardContainer from '$lib/components/atoms/card-container/card-container.svelte';

	export interface ContributionCalendarProps {
		activity: Array<{ date: Date; pages: number }>;
		class?: string;
	}
</script>

<script lang="ts">
	let { activity = [], class: className }: ContributionCalendarProps = $props();

	// Generate 53 weeks (GitHub style - always shows full year view)
	const today = new Date();
	const weeksToShow = 53;
	const weeks: Date[][] = [];
	let currentWeek: Date[] = [];

	// Start from 52 weeks ago, aligned to Sunday
	const startDate = subDays(today, 52 * 7);
	const firstSunday = startOfWeek(startDate, { weekStartsOn: 0 });

	for (let i = 0; i < weeksToShow * 7; i++) {
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
		'bg-neutral-800',
		'bg-red-500/20',
		'bg-red-500/40',
		'bg-red-500/60',
		'bg-red-500'
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

	// Calculate month label positions - only show when month actually changes
	const monthPositions = $derived(() => {
		const positions: Array<{ weekIndex: number; label: string }> = [];
		let lastMonth = -1;

		weeks.forEach((week, weekIndex) => {
			const firstDayOfWeek = week[0];
			const currentMonth = getMonth(firstDayOfWeek);
			const dayOfMonth = getDate(firstDayOfWeek);

			// Show month label if:
			// 1. This is the first week
			// 2. Month changed AND the first day is within first 7 days of month (close to actual start)
			if (weekIndex === 0 || (currentMonth !== lastMonth && dayOfMonth <= 7)) {
				positions.push({ weekIndex, label: monthNames[currentMonth] });
				lastMonth = currentMonth;
			}
		});

		return positions;
	});
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
	<div class="w-full flex justify-center">
		<div class="inline-flex flex-col gap-1">
			<!-- Month labels row - using CSS grid for perfect alignment -->
			<div
				class="grid text-xs text-muted-foreground"
				style="grid-template-columns: 24px repeat({weeks.length}, 10px); gap: 3px;"
			>
				<div></div>
				{#each monthPositions() as { weekIndex, label }, i (i)}
					<div style="grid-column: {weekIndex + 2}; text-align: left;" class="whitespace-nowrap">
						{label}
					</div>
				{/each}
			</div>

			<!-- Main grid with day labels -->
			<div class="flex gap-[3px]">
				<!-- Day labels column -->
				<div class="flex flex-col gap-[3px] text-xs text-muted-foreground pr-2">
					<div class="h-[10px]"></div>
					<div class="h-[10px] leading-[10px]">Mon</div>
					<div class="h-[10px]"></div>
					<div class="h-[10px] leading-[10px]">Wed</div>
					<div class="h-[10px]"></div>
					<div class="h-[10px] leading-[10px]">Fri</div>
					<div class="h-[10px]"></div>
				</div>

				<!-- Calendar grid - CSS grid for perfect alignment -->
				<div
					class="grid"
					style="grid-template-columns: repeat({weeks.length}, 10px); grid-template-rows: repeat(7, 10px); gap: 3px;"
				>
					{#each weeks as week, weekIndex (weekIndex)}
						{#each week as day, dayIndex (`${weekIndex}-${dayIndex}`)}
							{@const level = getActivityLevel(day)}
							<div
								class="rounded-sm {levelClasses[
									level
								]} transition-colors hover:ring-2 hover:ring-red-500/50 cursor-pointer"
								style="grid-column: {weekIndex + 1}; grid-row: {dayIndex + 1};"
								title="{format(day, 'MMM d, yyyy')}: {activity.find((a) => isSameDay(a.date, day))
									?.pages || 0} pages"
							></div>
						{/each}
					{/each}
				</div>
			</div>
		</div>
	</div>
</CardContainer>
