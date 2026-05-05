import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Server-only Supabase client using the service role key.
 * This client bypasses RLS and should NEVER be used in the browser
 * or exposed to the client in any way.
 */
export function getSupabaseServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Database operations are disabled.")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Public Supabase client for browser-side usage.
 * Uses the anon key and respects RLS policies.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
