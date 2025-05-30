import type { EnvBuilderOptions } from '../envBuilder.js';

export const ExampleEnv: string = `# StudioCMS Environment Variables

# libSQL URL and Token for AstroDB
ASTRO_DB_REMOTE_URL=libsql://your-database.turso.io
ASTRO_DB_APP_TOKEN=

# Auth encryption key
CMS_ENCRYPTION_KEY="..." # openssl rand --base64 16

# credentials for GitHub OAuth
CMS_GITHUB_CLIENT_ID=
CMS_GITHUB_CLIENT_SECRET=
CMS_GITHUB_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/github/callback

# credentials for Discord OAuth
CMS_DISCORD_CLIENT_ID=
CMS_DISCORD_CLIENT_SECRET=
CMS_DISCORD_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/discord/callback

# credentials for Google OAuth
CMS_GOOGLE_CLIENT_ID=
CMS_GOOGLE_CLIENT_SECRET=
CMS_GOOGLE_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/google/callback

# credentials for auth0 OAuth
CMS_AUTH0_CLIENT_ID=
CMS_AUTH0_CLIENT_SECRET=
CMS_AUTH0_DOMAIN=
CMS_AUTH0_REDIRECT_URI=http://localhost:4321/studiocms_api/auth/auth0/callback

## Cloudinary Javascript SDK
CMS_CLOUDINARY_CLOUDNAME="demo"`;

export function buildEnvFile(envBuilderOpts: EnvBuilderOptions): string {
	// Initialize with base environment variables that are always needed
	let envFileContent = `# StudioCMS Environment Variables

# libSQL URL and Token for AstroDB
ASTRO_DB_REMOTE_URL=${envBuilderOpts.astroDbRemoteUrl || ''}
ASTRO_DB_APP_TOKEN=${envBuilderOpts.astroDbToken || ''}

# Auth encryption key
CMS_ENCRYPTION_KEY="${envBuilderOpts.encryptionKey}" # openssl rand --base64 16
`;

	// Check if OAuth options were selected before adding them to the env file
	const selectedOAuthProviders = envBuilderOpts.oAuthOptions || [];

	// Only include GitHub OAuth if it was selected
	if (selectedOAuthProviders.includes('github') && envBuilderOpts.githubOAuth) {
		envFileContent += `
# credentials for GitHub OAuth
CMS_GITHUB_CLIENT_ID=${envBuilderOpts.githubOAuth.clientId}
CMS_GITHUB_CLIENT_SECRET=${envBuilderOpts.githubOAuth.clientSecret}
CMS_GITHUB_REDIRECT_URI=${envBuilderOpts.githubOAuth.redirectUri}/studiocms_api/auth/github/callback
`;
	}

	// Only include Discord OAuth if it was selected
	if (selectedOAuthProviders.includes('discord') && envBuilderOpts.discordOAuth) {
		envFileContent += `
# credentials for Discord OAuth
CMS_DISCORD_CLIENT_ID=${envBuilderOpts.discordOAuth.clientId}
CMS_DISCORD_CLIENT_SECRET=${envBuilderOpts.discordOAuth.clientSecret}
CMS_DISCORD_REDIRECT_URI=${envBuilderOpts.discordOAuth.redirectUri}/studiocms_api/auth/discord/callback
`;
	}

	// Only include Google OAuth if it was selected
	if (selectedOAuthProviders.includes('google') && envBuilderOpts.googleOAuth) {
		envFileContent += `
# credentials for Google OAuth
CMS_GOOGLE_CLIENT_ID=${envBuilderOpts.googleOAuth.clientId}
CMS_GOOGLE_CLIENT_SECRET=${envBuilderOpts.googleOAuth.clientSecret}
CMS_GOOGLE_REDIRECT_URI=${envBuilderOpts.googleOAuth.redirectUri}/studiocms_api/auth/google/callback
`;
	}

	// Only include Auth0 OAuth if it was selected
	if (selectedOAuthProviders.includes('auth0') && envBuilderOpts.auth0OAuth) {
		envFileContent += `
# credentials for auth0 OAuth
CMS_AUTH0_CLIENT_ID=${envBuilderOpts.auth0OAuth.clientId}
CMS_AUTH0_CLIENT_SECRET=${envBuilderOpts.auth0OAuth.clientSecret}
CMS_AUTH0_DOMAIN=${envBuilderOpts.auth0OAuth.domain}
CMS_AUTH0_REDIRECT_URI=${envBuilderOpts.auth0OAuth.redirectUri}/studiocms_api/auth/auth0/callback
`;
	}

	// Add Cloudinary section at the end, as it's not part of OAuth selection
	envFileContent += `
## Cloudinary Javascript SDK
CMS_CLOUDINARY_CLOUDNAME="demo"
`;

	return envFileContent;
}
