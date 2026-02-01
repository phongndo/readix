/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as annotations from '../annotations.js';
import type * as bookmarks from '../bookmarks.js';
import type * as books from '../books.js';
import type * as documentText from '../documentText.js';
import type * as extraction from '../extraction.js';
import type * as files from '../files.js';
import type * as progress from '../progress.js';
import type * as readingPositions from '../readingPositions.js';
import type * as users from '../users.js';

import type { ApiFromModules, FilterApi, FunctionReference } from 'convex/server';

declare const fullApi: ApiFromModules<{
	annotations: typeof annotations;
	bookmarks: typeof bookmarks;
	books: typeof books;
	documentText: typeof documentText;
	extraction: typeof extraction;
	files: typeof files;
	progress: typeof progress;
	readingPositions: typeof readingPositions;
	users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, 'public'>>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, 'internal'>>;

export declare const components: {};
