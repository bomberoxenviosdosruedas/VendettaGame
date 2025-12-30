import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SideNav } from '@/components/dashboard/side-nav';
import { ResourceBar } from '@/components/dashboard/resource-bar';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { getUserProperty, getDashboardData } from '@/lib/services/game.service';
import { GameStateProvider } from '@/components/providers/game-state-provider';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch initial game state
  const propertyId = await getUserProperty(user.id);
  const initialData = propertyId ? await getDashboardData(propertyId) : null;

  return (
    <GameStateProvider initialData={initialData}>
      <SidebarProvider>
        <div className="flex min-h-screen bg-stone-300 text-black">
          <Sidebar>
            <SideNav userEmail={user.email} />
          </Sidebar>
          <SidebarInset>
            <div className="flex flex-1 flex-col">
              <header className="bg-primary/90 text-primary-foreground flex justify-start items-center px-4 py-1 text-sm border-b-2 border-black/20 shadow-md">
                <div className="flex items-center gap-2">
                  <SidebarTrigger />
                </div>
              </header>
              <ResourceBar />
              <main className="flex-1 p-4 overflow-y-auto">
                  {children}
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </GameStateProvider>
  );
}
