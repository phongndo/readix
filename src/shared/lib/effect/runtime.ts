import { Effect } from 'effect';
// Create a runtime that works with SvelteKit's request lifecycle
export const runPromise = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
	Effect.runPromise(effect);
export const runSync = <A, E>(effect: Effect.Effect<A, E, never>): A => Effect.runSync(effect);
// For use in +page.server.ts / +server.ts
export const runEffect = runPromise;
