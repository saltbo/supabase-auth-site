import { supabase } from './supabase'
import type { SiteConfig } from '@/../site.config.types'
import { defaultConfig } from '@/../site.config.default'

/**
 * Storage bucket name for site configuration
 */
export const CONFIG_BUCKET = 'auth-site'
const CONFIG_FILE = 'config.json'

let cachedConfig: SiteConfig | null = null

export function getCachedConfig(): SiteConfig | null {
  return cachedConfig
}

/**
 * Get SQL for setting up the storage bucket and policies
 */
export function getStorageSetupSQL(): string {
  return `-- Create the bucket
insert into storage.buckets (id, name, public)
values ('${CONFIG_BUCKET}', '${CONFIG_BUCKET}', true);

-- Allow public access to read config
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = '${CONFIG_BUCKET}' );

-- Allow authenticated users to upload config
create policy "Authenticated Insert"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = '${CONFIG_BUCKET}' );

create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id = '${CONFIG_BUCKET}' );`
}

/**
 * Merge a partial config with the default config
 * Ensures all required fields are present
 */
export function mergeWithDefaultConfig(partialConfig: Partial<SiteConfig> | null): SiteConfig {
  if (!partialConfig) {
    return defaultConfig
  }

  return {
    ...defaultConfig,
    ...partialConfig,
    site: {
      ...defaultConfig.site,
      ...partialConfig.site,
    },
    branding: {
      ...defaultConfig.branding,
      ...partialConfig.branding,
      logo: {
        ...defaultConfig.branding.logo,
        ...(partialConfig.branding?.logo || {}),
      },
    },
    theme: {
      ...defaultConfig.theme,
      ...partialConfig.theme,
    },
    auth: {
      ...defaultConfig.auth,
      ...partialConfig.auth,
      turnstile: {
        ...defaultConfig.auth.turnstile,
        ...(partialConfig.auth?.turnstile || {}),
      },
      cookieOptions: defaultConfig.auth.cookieOptions
        ? {
            ...defaultConfig.auth.cookieOptions,
            ...(partialConfig.auth?.cookieOptions || {}),
          }
        : undefined,
    },
  }
}

/**
 * Fetch site configuration from Storage
 * Returns null if config doesn't exist or on error
 */
export async function fetchConfigFromStorage(): Promise<SiteConfig | null> {
  try {
    console.log('Fetching config from Storage:', CONFIG_BUCKET, CONFIG_FILE)

    // Try method 1: Using download() API
    const { data, error } = await supabase.storage
      .from(CONFIG_BUCKET)
      .download(CONFIG_FILE)

    console.log('Storage download result:', { data, error, dataSize: data?.size })

    if (error) {
      console.warn('Failed to fetch config from Storage (download):', error)

      // Try method 2: Using public URL
      console.log('Trying public URL method...')
      const { data: publicUrlData } = supabase.storage
        .from(CONFIG_BUCKET)
        .getPublicUrl(CONFIG_FILE)

      if (publicUrlData?.publicUrl) {
        console.log('Fetching from public URL:', publicUrlData.publicUrl)
        const response = await fetch(publicUrlData.publicUrl)
        const text = await response.text()
        console.log('Config text from public URL:', text)

        if (text && text.trim() !== '') {
          const config = JSON.parse(text) as SiteConfig
          console.log('Parsed config from public URL:', config)
          cachedConfig = config
          return config
        }
      }

      return null
    }

    if (!data) {
      console.warn('No data returned from Storage')
      return null
    }

    const text = await data.text()
    console.log('Config text from Storage:', text, 'Length:', text.length)

    if (!text || text.trim() === '') {
      console.warn('Empty config text from Storage')
      return null
    }

    const config = JSON.parse(text) as SiteConfig
    console.log('Parsed config:', config)
    cachedConfig = config
    return config
  } catch (err) {
    console.error('Error parsing config from Storage:', err)
    return null
  }
}

/**
 * Upload site configuration to Storage
 * Uses upsert to create or update
 * Implements optimistic concurrency control using revision
 */
export async function uploadConfigToStorage(
  config: SiteConfig,
): Promise<void> {
  // 1. Fetch the latest config from storage to check for conflicts
  const latestConfig = await fetchConfigFromStorage()
  
  if (latestConfig) {
    // 2. Compare revisions
    if (latestConfig.revision > config.revision) {
      throw new Error(
        `Conflict detected: The configuration has been updated by someone else (v${latestConfig.revision}). Please refresh the page and try again.`
      )
    }
  }

  // 3. Increment revision for the new save
  const updatedConfig = {
    ...config,
    revision: (config.revision || 0) + 1
  }

  const blob = new Blob([JSON.stringify(updatedConfig, null, 2)], {
    type: 'application/json',
  })

  const { error } = await supabase.storage
    .from(CONFIG_BUCKET)
    .upload(CONFIG_FILE, blob, { upsert: true })

  if (error) {
    if (error.message.includes('bucket not found') || error.message.includes('Bucket not found')) {
      throw new Error(`Storage bucket "${CONFIG_BUCKET}" not found. Please create it in your Supabase project first.`)
    }
    throw new Error(`Failed to upload config: ${error.message}`)
  }
  
  // Update cache
  cachedConfig = updatedConfig
}

/**
 * Check if current user is an admin
 * Admins are configured via VITE_ADMIN_EMAILS environment variable
 */
export function isUserAdmin(userEmail?: string | null): boolean {
  if (!userEmail) return false

  const adminEmails = import.meta.env.VITE_ADMIN_EMAILS?.split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean) || []

  return adminEmails.includes(userEmail.toLowerCase())
}

/**
 * Check if config file exists in Storage
 */
export async function configExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(CONFIG_BUCKET)
      .list()

    if (error) {
      console.warn('Error checking config existence:', error)
      return false
    }

    return data?.some((file) => file.name === CONFIG_FILE) || false
  } catch (err) {
    console.error('Error checking config existence:', err)
    return false
  }
}

/**
 * Initialize config from default configuration
 * Used for first-time setup
 */
export async function initializeConfig(): Promise<void> {
  // Import default config dynamically to avoid circular dependency
  const { defaultConfig } = await import('@/../site.config.default')

  if (!defaultConfig) {
    throw new Error('Failed to load default configuration')
  }

  await uploadConfigToStorage(defaultConfig)
}
