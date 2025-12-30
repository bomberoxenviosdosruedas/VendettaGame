import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
        // For password recovery, Supabase redirects to the specified URL.
        // After code exchange, we can check for user and redirect to a reset password page.
        const { data: { user } } = await supabase.auth.getUser()
        if (searchParams.get('type') === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }
        return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?message=No se pudo autenticar al usuario.`)
}
