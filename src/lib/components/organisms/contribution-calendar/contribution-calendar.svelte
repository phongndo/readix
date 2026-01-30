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

	// Generate 52 weeks (GitHub shows 53 columns including partial first week)
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

	// Calculate total pages for stats
	const totalPages = $derived(activity.reduce((sum, a) => sum + a.pages, 0));

	// Calculate month positions aligned with week columns
	const monthPositions = $derived(() => {
		const positions: Array<{ weekIndex: number; label: string }> = [];
		let lastMonth = -1;

		weeks.forEach((week, weekIndex) => {
			const firstDayOfWeek = week[0];
			const currentMonth = getMonth(firstDayOfWeek);

			if (currentMonth !== lastMonth) {
				positions.push({ weekIndex, label: monthNames[currentMonth] });
				lastMonth = currentMonth;
			}
		});

		return positions;
	});
</script>

<CardContainer padding="lg" class={className}>
	<!-- Stats Header -->
	<div class="mb-4 flex items-baseline justify-between">
		<h3 class="text-lg font-semibold">Reading Activity</h3>
		<span class="text-sm text-muted-foreground">{totalPages.toLocaleString()} pages this year</span>
	</div>

	<!-- Calendar Container -->
	<div class="w-full overflow-x-auto pb-2">
		<div class="min-w-max">
			<!-- Month labels row - exactly aligned with week columns -->
			<div class="flex text-xs text-muted-foreground mb-1">
				<!-- Spacer for day labels -->
				<div class="w-[28px] flex-shrink-0"></div>
				<!-- Month labels positioned at exact week column boundaries -->
				<div class="flex gap-[2px]">
					{#each monthPositions() as { weekIndex, label }, i (i)}
						<div
							class="flex-shrink-0 text-left"
							style="width: 10px; margin-left: {weekIndex > 0 ? `${weekIndex * 12}px` : '0'}"
						>
							{label}
						</div>
					{/each}
				</div>
			</div>

			<!-- Main grid with day labels -->
			<div class="flex gap-[2px]">
				<!-- Day labels column -->
				<div
					class="flex flex-col gap-[2px] text-xs text-muted-foreground pr-2 w-[26px] flex-shrink-0"
				>
					<div class="h-[10px]"></div>
					<div class="h-[10px] leading-[10px]">Mon</div>
					<div class="h-[10px]"></div>
					<div class="h-[10px] leading-[10px]">Wed</div>
					<div class="h-[10px]"></div>
					<div class="h-[10px] leading-[10px]">Fri</div>
					<div class="h-[10px]"></div>
				</div>

				<!-- Calendar grid - flex layout matching GitHub exactly -->
				<div class="flex gap-[2px]">
					{#each weeks as week, weekIndex (weekIndex)}
						<div class="flex flex-col gap-[2px] flex-shrink-0">
							{#each week as day, dayIndex (`${weekIndex}-${dayIndex}`)}
								{@const level = getActivityLevel(day)}
								<div
									class="w-[10px] h-[10px] rounded-sm {levelClasses[
										level
									]} transition-colors hover:ring-2 hover:ring-red-500/50 cursor-pointer flex-shrink-0"
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

	<!-- Legend - bottom right aligned -->
	<div class="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
		<span>Less</span>
		<div class="flex gap-[2px]">
			{#each levelClasses as cls, index (index)}
				<div class="w-[10px] h-[10px] rounded-sm {cls}"></div>
			{/each}
		</div>
		<span>More</span>
	</div>
</CardContainer>
