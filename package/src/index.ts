import { Option } from '@commander-js/extra-typings';
import chalk from 'chalk';
import { getTurso } from './cmds/getTurso.js';
import { InteractiveCMD } from './cmds/interactive/index.js';
import { Command } from './utils/commander.js';
import {
	CLITitle,
	ChalkColorOption,
	ChalkColorOptionNo,
	StudioCMSColorwayError,
	logger,
	termPrefix,
} from './utils/index.js';
import readJson from './utils/readJson.js';

const pkgJson = readJson<{ version: string }>(new URL('../package.json', import.meta.url));

const main = await new Command('create-studiocms')
	.description('StudioCMS CLI Utility Toolkit.')
	.version(pkgJson.version, '-V, --version', 'Output the current version of the CLI Toolkit.')
	.addHelpText('beforeAll', CLITitle)
	.addHelpText(
		'afterAll',
		`\n${termPrefix}${chalk.dim.italic(`${chalk.reset(StudioCMSColorwayError('*'))} Indicates the default command that is run when calling this CLI.`)}`
	)
	.showHelpAfterError('(add --help for additional information)')
	.enablePositionalOptions(true)

	// Global Options
	.addOption(ChalkColorOption)
	.addOption(ChalkColorOptionNo)

	// Commands
	.addCommand(InteractiveCMD, { isDefault: true })
	.addCommand(getTurso)

	// Parse the command line arguments and run the program
	.parseAsync();

export { main };
export { setStdout } from './utils/messages.js';
export * from './cmds/interactive/index.js';
export { templateRegistry } from './templates.config.js';
