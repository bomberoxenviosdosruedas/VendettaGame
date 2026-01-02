import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getBuildingProductionProjection } from '@/lib/actions/buildings';
import BuildingDetailsHeader from '@/components/buildings/building-details-header';
import ProductionTable from '@/components/buildings/production-table';
import { BaseBuildingRPC } from '@/types/legacy_schema';

export default async function BuildingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Fetch Base ID (Assuming single base)
    const { data: bases } = await supabase.from('bases').select('id').eq('user_id', user.id).limit(1);
    if (!bases || bases.length === 0) return <div>No base found</div>;
    const baseId = bases[0].id;

    // Fetch Building Details via RPC (reuse get_base_buildings but filter in JS or DB)
    // Ideally we should have get_building_details RPC, but get_base_buildings works if we filter.
    // Efficiency note: Fetching all buildings to find one is suboptimal but acceptable for migration MVP (10-20 items).
    const { data: allBuildings, error } = await supabase.rpc('get_base_buildings', { p_base_id: baseId });

    if (error || !allBuildings) {
        return <div>Error loading building</div>;
    }

    // Cast and Find
    const buildings = allBuildings as BaseBuildingRPC[];
    const building = buildings.find(b => b.building_id === id); // building_id is the config id (e.g. 'armeria')

    if (!building) {
        return <div>Edificio no encontrado o no disponible.</div>;
    }

    // Fetch Production Projection
    const projection = await getBuildingProductionProjection(baseId, id);

    return (
        <div className="container mx-auto p-4 space-y-6">
            <BuildingDetailsHeader building={building} />
            <ProductionTable projection={projection} currentLevel={building.level} />
        </div>
    );
}
