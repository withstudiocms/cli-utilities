import { tasks } from '@clack/prompts';
import { StudioCMSColorwayBg, StudioCMSColorwayError } from '@withstudiocms/cli-kit/colors';
import { Command, Option } from '@withstudiocms/cli-kit/commander';
import { CLITitle, label, random, say, termPrefix } from '@withstudiocms/cli-kit/messages';
import chalk from 'chalk';
import { install } from './actions/install';
import { verify } from './actions/verify';
import { getContext } from './utils/context';
import { bye, celebrations, done } from './utils/messages';
import readJson from './utils/readJson';

export { collectPackageInfo } from './actions/verify';
export { install, verify, getContext };

const pkgJson = readJson<{ version: string }>(new URL('../package.json', import.meta.url));

await new Command('upgrade')
	.description('Upgrade StudioCMS packages')
	.version(pkgJson.version, '-v, --version', 'Output the current version of the upgrade CLI')
	.addHelpText('beforeAll', CLITitle)
	.addHelpText(
		'afterAll',
		`\n${termPrefix}${chalk.dim.italic(`${chalk.reset(StudioCMSColorwayError('*'))} Indicates the default command that is run when calling this CLI.`)}`
	)
	.showHelpAfterError('(add --help for additional information)')
	.argument(
		'[version]',
		'Specific tag to resolve packages against. If not included, will use the latest tag.'
	)
	.addOption(new Option('--dry-run'))
	// Global Options
	.addOption(new Option('--color', 'Force color output') /* implemented by chalk */)
	.addOption(new Option('--no-color', 'Disable color output') /* implemented by chalk */)
	.enablePositionalOptions(true)
	.action(async (version, flags) => {
		const context = await getContext(version || 'latest', flags);

		context.prompt.intro(`${label('StudioCMS', StudioCMSColorwayBg, chalk.black)} Upgrade CLI`);

		const steps = [verify, install];

		for (const step of steps) {
			await step(context);
		}

		if (context.tasks) {
			await tasks(context.tasks);
		}

		await say([`${random(celebrations)} ${random(done)}`, random(bye)], { clear: false });

		process.exit(0);
	})
	.parseAsync();
