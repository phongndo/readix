import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'rm -rf .vercel/output && bun run build && bun run preview',
		port: 4173
	},
	testDir: 'e2e'
});
