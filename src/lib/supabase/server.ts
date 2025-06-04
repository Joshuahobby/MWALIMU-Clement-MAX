import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database.types'

/**
 * Creates a supabase client for use in server components
 * This function must be called in a server context with access to cookies
 */
export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export default createClient 