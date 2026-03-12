import { Effect, Layer, ManagedRuntime } from 'effect';

const appRuntime = ManagedRuntime.make(Layer.empty);

export type EffectResult<T, E = unknown, R = never> = Effect.Effect<T, E, R>;

export const runAppEffect = <T, E>(effect: Effect.Effect<T, E, never>): Promise<T> =>
	appRuntime.runPromise(effect);

export const AppRuntime = runAppEffect;

export function forkLoggedEffect<T, E>(effect: Effect.Effect<T, E, never>, context: string): void {
	void runAppEffect(effect).catch((error) => {
		console.error(`${context}:`, error);
	});
}
