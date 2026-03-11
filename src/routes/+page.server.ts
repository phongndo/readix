import type { PageServerLoad } from './$types';
import { loadDashboardOverview } from '$lib/services/readingOverviewService';

export const load: PageServerLoad = async ({ locals }) =>
	loadDashboardOverview(locals.auth().userId);
