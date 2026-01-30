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
	const weeksToShow = 52;
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

	// Calculate total pages for stats
	const totalPages = $derived(activity.reduce((sum, a) => sum + a.pages, 0));

	// Calculate which weeks should show month labels
	const monthLabelWeeks = $derived(() => {
		const labels: Array<{ index: number; label: string }> = [];
		let lastMonth = -1;

		weeks.forEach((week, index) => {
			const month = getMonth(week[0]);
			if (month !== lastMonth) {
				labels.push({ index, label: monthNames[month] });
				lastMonth = month;
			}
		});

		return labels;
	});
</script>

<CardContainer padding="lg" class={className}>
	<!-- Header -->
	<div class="mb-4 flex items-baseline justify-between">
		<h3 class="text-lg font-semibold">Reading Activity</h3>
		<span class="text-sm text-muted-foreground">{totalPages.toLocaleString()} pages this year</span>
	</div>

	<!-- Calendar -->
	<div class="w-full">
		<!-- Month Labels -->
		<div class="flex text-xs text-muted-foreground mb-1">
			<div class="w-8 flex-shrink-0"></div>
			<div
				class="flex-1 grid"
				style="grid-template-columns: repeat({weeks.length}, 1fr); gap: 2px;"
			>
				{#each monthLabelWeeks() as { index, label } (index)}
					<div style="grid-column: {index + 1}">{label}</div>
				{/each}
			</div>
		</div>

		<!-- Grid with Day Labels -->
		<div class="flex gap-1">
			<!-- Day Labels -->
			<div class="flex flex-col gap-1 text-xs text-muted-foreground w-8 flex-shrink-0">
				<div class="h-3"></div>
				<div class="h-3">Mon</div>
				<div class="h-3"></div>
				<div class="h-3">Wed</div>
				<div class="h-3"></div>
				<div class="h-3">Fri</div>
				<div class="h-3"></div>
			</div>

			<!-- Activity Grid - fills available width -->
			<div
				class="flex-1 grid"
				style="grid-template-columns: repeat({weeks.length}, 1fr); grid-template-rows: repeat(7, 1fr); gap: 2px; aspect-ratio: {weeks.length} / 7;"
			>
				{#each weeks as week, weekIndex (weekIndex)}
					{#each week as day, dayIndex (`${weekIndex}-${dayIndex}`)}
						{@const level = getActivityLevel(day)}
						<div
							class="rounded-sm {levelClasses[
								level
							]} min-w-[8px] min-h-[8px] transition-colors hover:ring-2 hover:ring-red-500/50 cursor-pointer"
							style="grid-column: {weekIndex + 1}; grid-row: {dayIndex + 1};"
							title="{format(day, 'MMM d, yyyy')}: {activity.find((a) => isSameDay(a.date, day))
								?.pages || 0} pages"
						></div>
					{/each}
				{/each}
			</div>
		</div>
	</div>

	<!-- Legend -->
	<div class="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
		<span>Less</span>
		<div class="flex gap-1">
			{#each levelClasses as cls (cls)}
				<div class="w-3 h-3 rounded-sm {cls}"></div>
			{/each}
		</div>
		<span>More</span>
	</div>
</CardContainer>
