import type { PageServerLoad } from './$types';
import { loadProfileOverview } from '$lib/services/readingOverviewService';

export const load: PageServerLoad = async ({ locals }) => loadProfileOverview(locals.auth().userId);
