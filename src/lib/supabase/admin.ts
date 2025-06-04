import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database.types'

/**
 * Creates a Supabase admin client with the service role key
 * This client has admin privileges and should only be used in trusted server contexts
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}

export default createAdminClient 