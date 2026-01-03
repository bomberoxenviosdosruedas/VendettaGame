import { getFleetData } from '@/lib/actions/fleet';
import ActiveFleets from '@/components/fleet/ActiveFleets';
import MissionPlanner from '@/components/fleet/MissionPlanner';

export default async function FleetPage() {
    const { movements, availableTroops } = await getFleetData();

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                <MissionPlanner troops={availableTroops} />
            </div>
            <div>
                <ActiveFleets movements={movements} />
            </div>
        </div>
    );
}
