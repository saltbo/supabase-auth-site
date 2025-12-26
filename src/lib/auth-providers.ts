import type { IconType } from 'react-icons'
import {
  SiApple,
  SiGoogle,
  SiGithub,
  SiGitlab,
  SiFacebook,
  SiX,
  SiDiscord,
  SiSlack,
  SiLinkedin,
  SiBitbucket,
  SiNotion,
  SiFigma,
  SiSpotify,
  SiTwitch,
  SiKakao,
  SiKeycloak,
  SiZoom,
  SiFlydotio,
} from 'react-icons/si'
import { FaMicrosoft } from 'react-icons/fa6'
import { KeyRound } from 'lucide-react'

/**
 * OAuth Provider metadata
 */
export interface ProviderMetadata {
  name: string
  displayName: string
  icon: IconType | React.ComponentType<{ className?: string }>
  defaultScopes?: string
  description?: string
}

/**
 * All supported OAuth providers with their metadata
 * Providers are defined in code to maintain consistency
 * Only enabled/disabled state is configured in Storage
 */
export const AUTH_PROVIDERS: Record<string, ProviderMetadata> = {
  google: {
    name: 'google',
    displayName: 'Google',
    icon: SiGoogle,
    defaultScopes: 'openid email profile',
    description: 'Sign in with your Google account',
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: SiGithub,
    defaultScopes: 'read:user user:email',
    description: 'Sign in with your GitHub account',
  },
  gitlab: {
    name: 'gitlab',
    displayName: 'GitLab',
    icon: SiGitlab,
    defaultScopes: 'read_user',
    description: 'Sign in with your GitLab account',
  },
  apple: {
    name: 'apple',
    displayName: 'Apple',
    icon: SiApple,
    defaultScopes: 'name email',
    description: 'Sign in with Apple',
  },
  microsoft: {
    name: 'microsoft',
    displayName: 'Microsoft',
    icon: FaMicrosoft,
    defaultScopes: 'openid email profile',
    description: 'Sign in with your Microsoft account',
  },
  azure: {
    name: 'azure',
    displayName: 'Azure AD',
    icon: FaMicrosoft,
    defaultScopes: 'openid email profile',
    description: 'Sign in with Azure Active Directory',
  },
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    icon: SiFacebook,
    defaultScopes: 'email',
    description: 'Sign in with your Facebook account',
  },
  twitter: {
    name: 'twitter',
    displayName: 'X (Twitter)',
    icon: SiX,
    description: 'Sign in with X (formerly Twitter)',
  },
  x: {
    name: 'x',
    displayName: 'X',
    icon: SiX,
    description: 'Sign in with X',
  },
  discord: {
    name: 'discord',
    displayName: 'Discord',
    icon: SiDiscord,
    defaultScopes: 'identify email',
    description: 'Sign in with your Discord account',
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    icon: SiSlack,
    defaultScopes: 'identity.basic identity.email',
    description: 'Sign in with your Slack workspace',
  },
  slack_oidc: {
    name: 'slack_oidc',
    displayName: 'Slack (OIDC)',
    icon: SiSlack,
    defaultScopes: 'openid email profile',
    description: 'Sign in with Slack (OpenID Connect)',
  },
  linkedin: {
    name: 'linkedin',
    displayName: 'LinkedIn',
    icon: SiLinkedin,
    defaultScopes: 'r_liteprofile r_emailaddress',
    description: 'Sign in with your LinkedIn account',
  },
  linkedin_oidc: {
    name: 'linkedin_oidc',
    displayName: 'LinkedIn (OIDC)',
    icon: SiLinkedin,
    defaultScopes: 'openid email profile',
    description: 'Sign in with LinkedIn (OpenID Connect)',
  },
  bitbucket: {
    name: 'bitbucket',
    displayName: 'Bitbucket',
    icon: SiBitbucket,
    defaultScopes: 'account email',
    description: 'Sign in with your Bitbucket account',
  },
  notion: {
    name: 'notion',
    displayName: 'Notion',
    icon: SiNotion,
    description: 'Sign in with your Notion account',
  },
  figma: {
    name: 'figma',
    displayName: 'Figma',
    icon: SiFigma,
    defaultScopes: 'file_read',
    description: 'Sign in with your Figma account',
  },
  spotify: {
    name: 'spotify',
    displayName: 'Spotify',
    icon: SiSpotify,
    defaultScopes: 'user-read-email user-read-private',
    description: 'Sign in with your Spotify account',
  },
  twitch: {
    name: 'twitch',
    displayName: 'Twitch',
    icon: SiTwitch,
    defaultScopes: 'user:read:email',
    description: 'Sign in with your Twitch account',
  },
  kakao: {
    name: 'kakao',
    displayName: 'Kakao',
    icon: SiKakao,
    description: 'Sign in with your Kakao account',
  },
  keycloak: {
    name: 'keycloak',
    displayName: 'Keycloak',
    icon: SiKeycloak,
    defaultScopes: 'openid email profile',
    description: 'Sign in with Keycloak',
  },
  zoom: {
    name: 'zoom',
    displayName: 'Zoom',
    icon: SiZoom,
    defaultScopes: 'user:read',
    description: 'Sign in with your Zoom account',
  },
  fly: {
    name: 'fly',
    displayName: 'Fly.io',
    icon: SiFlydotio,
    description: 'Sign in with Fly.io',
  },
  workos: {
    name: 'workos',
    displayName: 'WorkOS',
    icon: KeyRound,
    description: 'Sign in with WorkOS SSO',
  },
}

/**
 * Get list of all available provider names
 */
export const AVAILABLE_PROVIDERS = Object.keys(AUTH_PROVIDERS)

/**
 * Get provider metadata by name
 * Falls back to a default if provider not found
 */
export function getProviderMetadata(
  providerName: string,
): ProviderMetadata {
  return (
    AUTH_PROVIDERS[providerName.toLowerCase()] || {
      name: providerName,
      displayName:
        providerName.charAt(0).toUpperCase() + providerName.slice(1),
      icon: KeyRound,
      description: `Sign in with ${providerName}`,
    }
  )
}

/**
 * Get provider icon component
 */
export function getProviderIcon(
  providerName: string,
): IconType | React.ComponentType<{ className?: string }> {
  return getProviderMetadata(providerName).icon
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(providerName: string): string {
  return getProviderMetadata(providerName).displayName
}
