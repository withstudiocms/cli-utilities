// Users might lack access to the global npm registry, this function
// checks the user's project type and will return the proper npm registry
//

import { exec } from '@withstudiocms/cli-kit/utils';
import { detect } from 'package-manager-detector';

// This function is adapted from similar utilities in other projects
let _registry: string;
export async function getRegistry(): Promise<string> {
	if (_registry) return _registry;
	const fallback = 'https://registry.npmjs.org';
	const packageManager = (await detect())?.name || 'npm';
	try {
		const { stdout } = await exec(packageManager, ['config', 'get', 'registry']);
		_registry = stdout.trim()?.replace(/\/$/, '') || fallback;
		// Detect cases where the shell command returned a non-URL (e.g. a warning)
		try {
			const url = new URL(_registry);
			if (!url.host || !['http:', 'https:'].includes(url.protocol)) _registry = fallback;
		} catch {
			_registry = fallback;
		}
	} catch {
		_registry = fallback;
	}
	return _registry;
}
