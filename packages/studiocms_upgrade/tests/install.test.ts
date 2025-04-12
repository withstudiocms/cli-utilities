import * as prompts from '@clack/prompts';
import type { DetectResult } from 'package-manager-detector';
import { describe, expect, it } from 'vitest';
import { install } from '../src/actions/install';
import type { Context } from '../src/utils/context';
import { setup } from './utils.js';

describe('install', () => {
	// const fixture = setup();
	const ctx: Pick<
		Context,
		'prompt' | 'packageManager' | 'cwd' | 'exit' | 'tasks' | 'packages' | 'dryRun' | 'version'
	> & { messages: string[] } = {
		cwd: '' as unknown as URL,
		version: 'latest',
		packageManager: 'npm' as unknown as DetectResult,
		dryRun: true,
		packages: [],
		prompt: {
			// @ts-ignore
			log: {
				info: (str: string) => ctx.messages.push(str),
				warn: (str: string) => ctx.messages.push(str),
				error: (str: string) => ctx.messages.push(str),
			},
			// @ts-ignore
			note: (str: string, title?: string) => ctx.messages.push(str),
			// @ts-ignore
			isCancel: () => false,
			cancel: () => {},
			confirm: async ({ message }) => {
				ctx.messages.push(message);
				return true;
			},
		},
		exit(code) {
			process.exit(code);
		},
		tasks: [],
		messages: [],
	};

	it('up to date', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'studiocms',
					currentVersion: '1.0.0',
					targetVersion: '1.0.0',
				},
			],
		};
		await install(context);
		expect(ctx.messages.includes('studiocms is up to date on, v1.0.0')).toBe(true);
	});

	it('patch', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'studiocms',
					currentVersion: '1.0.0',
					targetVersion: '1.0.1',
				},
			],
		};
		await install(context);
		expect(ctx.messages.includes('      ●  studiocms can be updated from v1.0.0 to v1.0.1')).toBe(
			true
		);
	});

	it('minor', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'studiocms',
					currentVersion: '1.0.0',
					targetVersion: '1.2.0',
				},
			],
		};
		await install(context);
		expect(ctx.messages.includes('      ●  studiocms can be updated from v1.0.0 to v1.2.0')).toBe(
			true
		);
	});

	it('major (reject)', async () => {
		const context = {
			...ctx,
			packages: [
				{
					name: 'studiocms',
					currentVersion: '1.0.0',
					targetVersion: '2.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		console.log(ctx.messages);
		expect(ctx.messages.includes('      ▲  studiocms can be updated  from v1.0.0 to v2.0.0 ')).toBe(
			true
		);
		expect(ctx.messages.includes('check   Be sure to follow the CHANGELOG.')).toBe(false);
	});

	it('major (accept)', async () => {
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let exitCode;
		const context = {
			...ctx,
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'studiocms',
					currentVersion: '1.0.0',
					targetVersion: '2.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		console.log(ctx.messages);
		expect(ctx.messages.includes('      ▲  studiocms can be updated  from v1.0.0 to v2.0.0 ')).toBe(
			true
		);
		expect(exitCode).toBeUndefined();
		expect(ctx.messages.includes('Be sure to follow the CHANGELOG.')).toBe(true);
	});

	it('multiple major', async () => {
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let exitCode;
		const context = {
			...ctx,
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'a',
					currentVersion: '1.0.0',
					targetVersion: '2.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
				{
					name: 'b',
					currentVersion: '6.0.0',
					targetVersion: '7.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		console.log(ctx.messages);
		expect(ctx.messages.includes('      ▲  a can be updated  from v1.0.0 to v2.0.0 ')).toBe(true);
		expect(ctx.messages.includes('      ▲  b can be updated  from v6.0.0 to v7.0.0 ')).toBe(true);
		expect(exitCode).toBeUndefined();
		const [changelog, a, b] = ctx.messages.slice(-4);
		expect(changelog).toEqual('Be sure to follow the CHANGELOGs.');
		expect(a).toMatch('         a https://example.com');
		expect(b).toMatch('         b https://example.com');
	});

	it('current patch minor major', async () => {
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let exitCode;
		const context = {
			...ctx,
			exit: (code) => {
				exitCode = code;
			},
			packages: [
				{
					name: 'current',
					currentVersion: '1.0.0',
					targetVersion: '1.0.0',
				},
				{
					name: 'patch',
					currentVersion: '1.0.0',
					targetVersion: '1.0.1',
				},
				{
					name: 'minor',
					currentVersion: '1.0.0',
					targetVersion: '1.2.0',
				},
				{
					name: 'major',
					currentVersion: '1.0.0',
					targetVersion: '3.0.0',
					isMajor: true,
					changelogTitle: 'CHANGELOG',
					changelogURL: 'https://example.com',
				},
			],
		};
		await install(context);
		console.log(ctx.messages);
		expect(ctx.messages.includes('current is up to date on, v1.0.0')).toBe(true);
		expect(ctx.messages.includes('      ●  patch can be updated from v1.0.0 to v1.0.1')).toBe(true);
		expect(ctx.messages.includes('      ●  minor can be updated from v1.0.0 to v1.2.0')).toBe(true);
		expect(ctx.messages.includes('      ▲  major can be updated  from v1.0.0 to v3.0.0 ')).toBe(
			true
		);
		expect(exitCode).toBeUndefined();
		expect(ctx.messages.includes('Be sure to follow the CHANGELOG.')).toBe(true);
	});
});
