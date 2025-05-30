import { defineProject } from 'vitest/config';

process.env.NODE_OPTIONS ??= '--enable-source-maps';
process.setSourceMapsEnabled(true);

export default defineProject({
	test: {
		maxConcurrency: 1,
		name: '@withstudiocms/cli-kit',
	},
});
