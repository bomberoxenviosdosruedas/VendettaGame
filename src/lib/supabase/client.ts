import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://mxhbylhwbtanrlvakrur.supabase.co',
    'sb_publishable_01a7j7R3NY5j_HgWiYVIUg_vPuXUMiZ'
  )
}
