import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/types/database.types'

/**
 * Creates a supabase client for use in client components
 * This function should be used in any client-side code like event handlers
 */
export const createClient = () => {
  return createClientComponentClient<Database>()
}

export default createClient 