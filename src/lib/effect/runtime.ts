import { Effect, Layer } from 'effect';
import { type AppError } from './errors';

export type EffectResult<T> = Effect.Effect<T, AppError>;

export const AppRuntime = <T>(effect: Effect.Effect<T, AppError>): Promise<T> =>
	Effect.runPromise(effect);

export const defaultLayer = Layer.empty;

export function withDefaultLayer<T>(
	effect: Effect.Effect<T, AppError>
): Effect.Effect<T, AppError> {
	return effect;
}
