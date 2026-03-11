import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadWorkspaceOverview } from '$lib/services/readingOverviewService';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.auth().userId;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	return loadWorkspaceOverview(userId);
};
