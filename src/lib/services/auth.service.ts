import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signUp(data: { email: string; password: string; full_name: string }) {
  const supabase = await createClient()

  // The origin is needed for email verification links if we were using them,
  // but standard signup might not need it if not redirecting immediately with oauth.
  // However, for good measure let's get origin if possible, or use a default.
  // For password signup, Supabase might send a confirmation email.
  const origin = (await headers()).get('origin')

  const { error, data: authData } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
      },
      // If email confirmation is enabled, this is where they'll be redirected
      emailRedirectTo: `${origin}/auth/callback`, 
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: authData }
}

export async function signIn(data: { email: string; password: string }) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
