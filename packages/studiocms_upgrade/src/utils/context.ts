import { pathToFileURL } from 'node:url';
import * as prompt from '@clack/prompts';
import { type DetectResult, detect } from 'package-manager-detector';

export interface Context {
	prompt: typeof prompt;
	version: string;
	dryRun?: boolean;
	cwd: URL;
	stdin?: typeof process.stdin;
	stdout?: typeof process.stdout;
	packageManager: DetectResult;
	packages: PackageInfo[];
	exit(code: number): never;
	tasks: prompt.Task[];
}

export interface PackageInfo {
	name: string;
	currentVersion: string;
	targetVersion: string;
	tag?: string;
	isDevDependency?: boolean;
	isMajor?: boolean;
	changelogURL?: string;
	changelogTitle?: string;
}

export async function getContext(
	version = 'latest',
	flags?: {
		dryRun?: true | undefined;
	}
): Promise<Context> {
	let packageManager: DetectResult | null = null;
	try {
		packageManager = await detect({
			// Include the `install-metadata` strategy to have the package manager that's
			// used for installation take precedence
			strategies: ['install-metadata', 'lockfile', 'packageManager-field'],
		});
	} catch (error) {
		console.warn(
			'Failed to detect package manager:',
			error instanceof Error ? error.message : String(error)
		);
	}
	packageManager = packageManager ?? { agent: 'npm', name: 'npm' };
	return {
		prompt,
		packageManager,
		packages: [],
		cwd: new URL(`${pathToFileURL(process.cwd())}/`),
		dryRun: flags?.dryRun || false,
		version,
		exit(code) {
			process.exit(code);
		},
		tasks: [],
	};
}
