<script lang="ts">
	import { SignedIn, SignedOut, SignInButton, UserButton } from 'svelte-clerk';
	import { BookOpen, Trophy, Flame } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<main class="flex min-h-screen flex-col">
	<!-- Header -->
	<header class="border-b">
		<div class="container mx-auto flex items-center justify-between px-4 py-4">
			<div class="flex items-center gap-2">
				<BookOpen class="h-6 w-6" />
				<span class="text-xl font-bold">Readix</span>
			</div>
			<div>
				<SignedOut>
					<SignInButton mode="redirect">
						<Button>Get Started</Button>
					</SignInButton>
				</SignedOut>
				<SignedIn>
					<UserButton />
				</SignedIn>
			</div>
		</div>
	</header>

	<!-- Hero -->
	<section class="flex-1 py-20">
		<div class="container mx-auto px-4 text-center">
			<h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
				Read Smarter.<br />
				<span class="text-muted-foreground">Achieve More.</span>
			</h1>
			<p class="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
				Track your reading progress, build streaks, and unlock achievements. The reading platform
				that makes learning addictive.
			</p>
			<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
				<SignedOut>
					<SignInButton mode="redirect">
						<Button size="lg" class="px-8">Start Reading Free</Button>
					</SignInButton>
				</SignedOut>
				<SignedIn>
					<Button size="lg" class="px-8" href="/library">Go to Library</Button>
				</SignedIn>
			</div>
		</div>
	</section>

	<!-- Features -->
	<section class="border-t bg-muted/30 py-20">
		<div class="container mx-auto px-4">
			<div class="grid gap-8 md:grid-cols-3">
				<div class="flex flex-col items-center text-center">
					<div class="mb-4 rounded-full bg-primary/10 p-4">
						<BookOpen class="h-6 w-6 text-primary" />
					</div>
					<h3 class="mb-2 text-lg font-semibold">Track Progress</h3>
					<p class="text-sm text-muted-foreground">
						Monitor your reading journey with detailed progress tracking and insights.
					</p>
				</div>
				<div class="flex flex-col items-center text-center">
					<div class="mb-4 rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
						<Flame class="h-6 w-6 text-orange-600" />
					</div>
					<h3 class="mb-2 text-lg font-semibold">Build Streaks</h3>
					<p class="text-sm text-muted-foreground">
						Stay motivated with daily reading streaks and compete with yourself.
					</p>
				</div>
				<div class="flex flex-col items-center text-center">
					<div class="mb-4 rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
						<Trophy class="h-6 w-6 text-yellow-600" />
					</div>
					<h3 class="mb-2 text-lg font-semibold">Earn Achievements</h3>
					<p class="text-sm text-muted-foreground">
						Unlock badges and achievements as you reach reading milestones.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t py-8">
		<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
			<p>Built with SvelteKit, Effect, and Tailwind CSS</p>
		</div>
	</footer>
</main>
