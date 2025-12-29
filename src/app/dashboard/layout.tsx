import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SideNav } from './side-nav';
import { ResourceBar } from './resource-bar';
import { SignOutButton } from './sign-out-button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-stone-300 text-black">
      <SideNav />
      <div className="flex flex-1 flex-col">
        <header className="bg-primary/90 text-primary-foreground flex justify-between items-center px-4 py-1 text-sm border-b-2 border-black/20 shadow-md">
          <p>Conectado como: {user.email}</p>
          <SignOutButton />
        </header>
        <ResourceBar />
        <main className="flex-1 p-4 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
