import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { label, random, sleep } from '@withstudiocms/cli-kit/messages';
import { shell } from '@withstudiocms/cli-kit/utils';
import chalk from 'chalk';
import { resolveCommand } from 'package-manager-detector';
import terminalLink from 'terminal-link';
import type { Context, PackageInfo } from '../utils/context';
import { celebrations, done } from '../utils/messages';

export async function install(
	ctx: Pick<Context, 'prompt' | 'packageManager' | 'cwd' | 'exit' | 'tasks' | 'packages' | 'dryRun'>
) {
	ctx.prompt.note(
		`\n${label('StudioCMS', chalk.bgGreen, chalk.black)}  ${chalk.bold(
			'Package upgrade in progress.'
		)}`
	);

	const { current, dependencies, devDependencies } = filterPackages(ctx);
	const toInstall = [...dependencies, ...devDependencies].sort(sortPackages);
	for (const packageInfo of current.sort(sortPackages)) {
		const tag = /^\d/.test(packageInfo.targetVersion)
			? packageInfo.targetVersion
			: packageInfo.targetVersion.slice(1);
		ctx.prompt.log.info(`${packageInfo.name} is up to date on v${tag}`);
		await sleep(random(50, 150));
	}

	if (toInstall.length === 0 && !ctx.dryRun) {
		await success(random(celebrations), random(done), ctx);
		return;
	}
	const majors: PackageInfo[] = [];
	for (const packageInfo of toInstall) {
		const word = ctx.dryRun ? 'can' : 'will';
		await upgrade(packageInfo, `${word} be updated`, ctx);
		if (packageInfo.isMajor) {
			majors.push(packageInfo);
		}
	}

	if (majors.length > 0) {
		const shouldProceed = await ctx.prompt.confirm({
			message: `${pluralize(
				['One package has', 'Some packages have'],
				majors.length
			)} breaking changes. Continue?`,
			initialValue: true,
		});

		if (ctx.prompt.isCancel(shouldProceed)) {
			return ctx.exit(0);
		}

		if (!shouldProceed) {
			return ctx.exit(0);
		}

		ctx.prompt.log.warn(`Be sure to follow the ${pluralize('CHANGELOG', majors.length)}.`);
		for (const pkg of majors.sort(sortPackages)) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			await changelog(pkg.name, pkg.changelogTitle!, pkg.changelogURL!, ctx);
		}
	}

	if (ctx.dryRun) {
		ctx.prompt.note('Skipping dependency installation', '--dry-run');
	} else {
		await runInstallCommand(ctx, dependencies, devDependencies);
	}
}

function filterPackages(ctx: Pick<Context, 'packages'>) {
	const current: PackageInfo[] = [];
	const dependencies: PackageInfo[] = [];
	const devDependencies: PackageInfo[] = [];
	for (const packageInfo of ctx.packages) {
		const { currentVersion, targetVersion, isDevDependency } = packageInfo;
		// Remove prefix from version before comparing
		if (currentVersion.replace(/^\D+/, '') === targetVersion.replace(/^\D+/, '')) {
			current.push(packageInfo);
		} else {
			const arr = isDevDependency ? devDependencies : dependencies;
			arr.push(packageInfo);
		}
	}
	return { current, dependencies, devDependencies };
}

/**
 * An `Array#sort` comparator function to normalize how packages are displayed.
 * This only changes how the packages are displayed in the CLI, it is not persisted to `package.json`.
 */
function sortPackages(a: PackageInfo, b: PackageInfo): number {
	if (a.isMajor && !b.isMajor) return 1;
	if (b.isMajor && !a.isMajor) return -1;
	return a.name.localeCompare(b.name);
}

const success = async (prefix: string, text: string, ctx: Pick<Context, 'prompt'>) => {
	const length = 10 + prefix.length + text.length;
	if (length > process.stdout.columns) {
		ctx.prompt.log.success(`${chalk.green('✔')}  ${prefix}`);
		ctx.prompt.log.success(`${' '.repeat(4)}${chalk.dim(text)}`);
	} else {
		ctx.prompt.log.success(`${chalk.green('✔')}  ${prefix} ${chalk.dim(text)}`);
	}
};

const upgrade = async (packageInfo: PackageInfo, text: string, ctx: Pick<Context, 'prompt'>) => {
	const { name, isMajor = false, targetVersion, currentVersion } = packageInfo;

	const bg = isMajor ? (v: string) => chalk.bgYellow(chalk.black(` ${v} `)) : chalk.green;
	const style = isMajor ? chalk.yellow : chalk.green;
	const symbol = isMajor ? '▲' : '●';

	const fromVersion = currentVersion.replace(/^\D+/, '');
	const toVersion = targetVersion.replace(/^\D+/, '');
	const version = `from v${fromVersion} to v${toVersion}`;

	const length = 12 + name.length + text.length + version.length;
	if (length > process.stdout.columns) {
		ctx.prompt.log.info(`${style(symbol)}  ${name}`);
		ctx.prompt.log.info(`${' '.repeat(4)}${chalk.dim(text)} ${bg(version)}`);
	} else {
		ctx.prompt.log.info(`${style(symbol)}  ${name} ${chalk.dim(text)} ${bg(version)}`);
	}
};

function pluralize(word: string | [string, string], n: number) {
	const [singular, plural] = Array.isArray(word) ? word : [word, `${word}s`];
	if (n === 1) return singular;
	return plural;
}

const changelog = async (name: string, text: string, url: string, ctx: Pick<Context, 'prompt'>) => {
	const link = terminalLink(text, url, { fallback: () => url });
	const linkLength = terminalLink.isSupported ? text.length : url.length;
	const symbol = ' ';

	const length = 12 + name.length + linkLength;
	if (length > process.stdout.columns) {
		ctx.prompt.log.info(`${symbol}  ${name}`);
		ctx.prompt.log.info(`${' '.repeat(4)}${chalk.cyan(chalk.underline(link))}`);
	} else {
		ctx.prompt.log.info(`${symbol}  ${name} ${chalk.cyan(chalk.underline(link))}`);
	}
};

async function runInstallCommand(
	ctx: Pick<Context, 'prompt' | 'packageManager' | 'cwd' | 'exit' | 'tasks'>,
	dependencies: PackageInfo[],
	devDependencies: PackageInfo[]
) {
	const cwd = fileURLToPath(ctx.cwd);
	if (ctx.packageManager.name === 'yarn') await ensureYarnLock({ cwd });

	const installCommand = resolveCommand(ctx.packageManager.agent, 'add', []);
	if (!installCommand) {
		// NOTE: Usually it's impossible to reach here as `package-manager-detector` should
		// already match a supported agent
		ctx.prompt.log.error(`Unable to find install command for ${ctx.packageManager.name}.`);
		return ctx.exit(1);
	}

	ctx.tasks.push({
		title: 'Install Dependencies',
		task: async (message) => {
			message(`Installing dependencies with ${ctx.packageManager.name}...`);
			try {
				if (dependencies.length > 0) {
					await shell(
						installCommand.command,
						[
							...installCommand.args,
							...dependencies.map(
								({ name, targetVersion }) => `${name}@${targetVersion.replace(/^\^/, '')}`
							),
						],
						{ cwd, timeout: 90_000, stdio: 'ignore' }
					);
				}
				if (devDependencies.length > 0) {
					await shell(
						installCommand.command,
						[
							...installCommand.args,
							...devDependencies.map(
								({ name, targetVersion }) => `${name}@${targetVersion.replace(/^\^/, '')}`
							),
						],
						{ cwd, timeout: 90_000, stdio: 'ignore' }
					);
				}
			} catch {
				const manualInstallCommand = [
					installCommand.command,
					...installCommand.args,
					...[...dependencies, ...devDependencies].map(
						({ name, targetVersion }) => `${name}@${targetVersion}`
					),
				].join(' ');
				ctx.prompt.log.error(
					`Dependencies failed to install, please run the following command manually:\n${chalk.bold(manualInstallCommand)}`
				);
				return ctx.exit(1);
			}
		},
	});
}

/**
 * Yarn Berry (PnP) versions will throw an error if there isn't an existing `yarn.lock` file
 * If a `yarn.lock` file doesn't exist, this function writes an empty `yarn.lock` one.
 * Unfortunately this hack is required to run `yarn install`.
 *
 * The empty `yarn.lock` file is immediately overwritten by the installation process.
 * See https://github.com/withastro/astro/pull/8028
 */
async function ensureYarnLock({ cwd }: { cwd: string }) {
	const yarnLock = path.join(cwd, 'yarn.lock');
	if (fs.existsSync(yarnLock)) return;
	return fs.promises.writeFile(yarnLock, '', { encoding: 'utf-8' });
}
