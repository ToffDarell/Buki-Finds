import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// PKCE: after Google sign-in or an email confirmation, Supabase sends the browser back with a
// one-time ?code= that only this browser can redeem (it holds the matching secret), instead of
// putting the login tokens themselves in the address bar. The client redeems the code on load
// and removes it from the URL.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { flowType: 'pkce' },
})
