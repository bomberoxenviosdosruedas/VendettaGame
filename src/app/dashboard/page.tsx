import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Changelog } from './changelog'
import { Notices } from './notices'
import { TopPlayers } from './top-players'
import { SignOutButton } from './sign-out-button'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="bg-stone-200 text-black min-h-screen">
       <header className="bg-primary text-primary-foreground flex justify-between items-center px-4 py-2 text-sm">
          <p>Conectado como: {user.email}</p>
          <SignOutButton />
        </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <Changelog />
          <Notices />
          <TopPlayers />
        </div>
      </div>
    </div>
  )
}
