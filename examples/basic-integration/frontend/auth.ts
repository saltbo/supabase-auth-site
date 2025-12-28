import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

/**
 * Get the session from Supabase SDK. 
 * Note: The Auth Site must be configured to use a shared cookie domain.
 */
export async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  
  return {
    'Authorization': `Bearer ${session?.access_token}`
  }
}

// Example API call
async function fetchData() {
  const headers = await getAuthHeader()
  const response = await fetch('https://api.yourdomain.com/data', { headers })
  return response.json()
}
