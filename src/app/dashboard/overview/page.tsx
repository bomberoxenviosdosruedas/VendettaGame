import { createClient } from "@/lib/supabase/server";
import { getActiveMissions, getDashboardData, getFamilyInfo, getIncomingAttacks, getUserProperty } from "@/lib/services/game.service";
import { OverviewWrapper } from "@/components/dashboard/overview/overview-wrapper";
import { DashboardData } from "@/types/game";

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
    const [dashboardData, familyInfo] = await Promise.all([
        getDashboardData(propertyId),
        getFamilyInfo(user.id)
    ]);

    if (!dashboardData) {
        return <div>Error cargando datos.</div>;
    }

    return (
        <OverviewWrapper
            initialData={dashboardData}
            familyInfo={familyInfo}
        />
    );
}
