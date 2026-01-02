import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ConstructionQueue from '@/components/buildings/ConstructionQueue';
import BuildingList from '@/components/buildings/BuildingList';
import { BaseBuildingRPC, ConstructionQueueItem } from '@/types/legacy_schema';

export default async function BuildingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch Base (Assuming single base for now or first base)
  const { data: bases } = await supabase
    .from('bases')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (!bases || bases.length === 0) {
    // If no legacy base exists, handling is tricky. Redirect to creation or show error?
    // For now, let's assume one exists or redirect to an initializer.
    // Ideally we might trigger an initial setup here.
    return <div className="p-8 text-center">No base found. Please contact support or restart.</div>;
  }

  const baseId = bases[0].id;

  // Parallel Fetching
  const [buildingsRes, queueRes] = await Promise.all([
    supabase.rpc('get_base_buildings', { p_base_id: baseId }),
    supabase.rpc('get_construction_queue', { p_base_id: baseId }),
  ]);

  if (buildingsRes.error || queueRes.error) {
    console.error('Fetch Error:', buildingsRes.error, queueRes.error);
    return <div>Error loading building data.</div>;
  }

  // Cast to correct flat type
  const buildings = buildingsRes.data as BaseBuildingRPC[];
  const queue = queueRes.data as ConstructionQueueItem[];

  const isQueueFull = queue.length >= 5;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Habitaciones</h1>

      {/* Queue Section */}
      <section>
        <ConstructionQueue queue={queue} />
      </section>

      {/* Buildings Grid */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-slate-300">Edificios Disponibles</h2>
        <BuildingList
            buildings={buildings}
            baseId={baseId}
            isQueueFull={isQueueFull}
        />
      </section>
    </div>
  );
}
