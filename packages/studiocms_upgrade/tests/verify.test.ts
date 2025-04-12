import { beforeEach, describe, expect, it } from 'vitest';
import { collectPackageInfo } from '../src/actions/verify';

describe('collectPackageInfo', () => {
	const context = {
		version: 'latest',
		packages: [],
	};

	beforeEach(() => {
		context.packages = [];
	});

	it('detects studiocms', async () => {
		collectPackageInfo(context, { studiocms: '1.0.0' }, {});
		expect(context.packages).toEqual([
			{ name: 'studiocms', currentVersion: '1.0.0', targetVersion: 'latest' },
		]);
	});

	it('detects @studiocms', async () => {
		collectPackageInfo(context, { '@studiocms/blog': '1.0.0' }, {});
		expect(context.packages).toEqual([
			{ name: '@studiocms/blog', currentVersion: '1.0.0', targetVersion: 'latest' },
		]);
	});

	it('supports ^ prefixes', async () => {
		collectPackageInfo(context, { studiocms: '^1.0.0' }, {});
		expect(context.packages).toEqual([
			{ name: 'studiocms', currentVersion: '^1.0.0', targetVersion: 'latest' },
		]);
	});

	it('supports ~ prefixes', async () => {
		collectPackageInfo(context, { studiocms: '~1.0.0' }, {});
		expect(context.packages).toEqual([
			{ name: 'studiocms', currentVersion: '~1.0.0', targetVersion: 'latest' },
		]);
	});

	it('supports prereleases', async () => {
		collectPackageInfo(context, { studiocms: '1.0.0-beta.0' }, {});
		expect(context.packages).toEqual([
			{ name: 'studiocms', currentVersion: '1.0.0-beta.0', targetVersion: 'latest' },
		]);
	});

	it('ignores self', async () => {
		collectPackageInfo(context, { '@studiocms/upgrade': '0.0.1' }, {});
		expect(context.packages).toEqual([]);
	});

	it('ignores linked packages', async () => {
		collectPackageInfo(context, { '@studiocms/test': 'link:../packages/test' }, {});
		expect(context.packages).toEqual([]);
	});

	it('ignores workspace packages', async () => {
		collectPackageInfo(context, { '@studiocms/test': 'workspace:*' }, {});
		expect(context.packages).toEqual([]);
	});

	it('ignores github packages', async () => {
		collectPackageInfo(context, { '@studiocms/test': 'github:withstudiocms/studiocms-test' }, {});
		expect(context.packages).toEqual([]);
	});

	it('ignores tag', async () => {
		collectPackageInfo(context, { '@studiocms/test': 'beta' }, {});
		expect(context.packages).toEqual([]);
	});
});
