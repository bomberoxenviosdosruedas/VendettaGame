import { createClient } from "@/lib/supabase/server";
import { getActiveMissions, getDashboardData, getFamilyInfo, getIncomingAttacks, getUserProperty } from "@/lib/services/game.service";
import { OverviewDashboard } from "@/components/dashboard/overview/overview-dashboard";

export default async function OverviewPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Acceso denegado</div>;
    }

    const propertyId = await getUserProperty(user.id);

    if (!propertyId) {
        return <div>No se encontró propiedad para el usuario.</div>;
    }

    // Parallel data fetching
    const [dashboardData, attacks, missions, familyInfo] = await Promise.all([
        getDashboardData(propertyId),
        getIncomingAttacks(propertyId),
        getActiveMissions(propertyId),
        getFamilyInfo(user.id)
    ]);

    return (
        <OverviewDashboard 
            dashboardData={dashboardData}
            attacks={attacks}
            missions={missions}
            familyInfo={familyInfo}
        />
    );
}
