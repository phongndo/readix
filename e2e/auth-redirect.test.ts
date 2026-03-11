import { expect, test } from '@playwright/test';

const signInUrl = process.env.PUBLIC_CLERK_SIGN_IN_URL;

test.describe('protected routes', () => {
	test.skip(!signInUrl, 'PUBLIC_CLERK_SIGN_IN_URL is required for redirect assertions');

	for (const path of ['/library', '/workspace']) {
		test(`redirects unauthenticated users away from ${path}`, async ({ page }) => {
			await page.goto(path);
			await page.waitForURL((url) => url.toString().startsWith(signInUrl!));

			const redirectTarget = new URL(page.url());
			expect(`${redirectTarget.origin}${redirectTarget.pathname}`).toBe(signInUrl);
			expect(redirectTarget.searchParams.get('redirect_url')).toContain(path);
		});
	}
});
