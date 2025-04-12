import { describe, expect, it } from 'vitest';
import { getContext } from '../src/utils/context';

describe('context', () => {
	it('no arguments', async () => {
		const ctx = await getContext();
		expect(ctx.version).toBe('latest');
		expect(ctx.dryRun).toBeFalsy();
	});

	it('tag', async () => {
		const ctx = await getContext('beta');
		expect(ctx.version).toBe('beta');
		expect(ctx.dryRun).toBeFalsy();
	});

	it('dry run', async () => {
		const ctx = await getContext(undefined, { dryRun: true });
		expect(ctx.dryRun).toBe(true);
	});
});
