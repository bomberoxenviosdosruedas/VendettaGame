import { OverviewContent } from "@/components/dashboard/overview/overview-content";
import { getDashboardData, getIncomingAttacks, getActiveMissions, getFamilyInfo, getUserProperty } from "@/lib/services/game.service";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OverviewPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const propertyId = await getUserProperty(user.id);

    if (!propertyId) {
        return <div className="p-4 text-center">No se encontró una propiedad asociada a tu cuenta.</div>;
    }

    const [dashboardData, attacks, missions, family] = await Promise.all([
        getDashboardData(propertyId),
        getIncomingAttacks(propertyId),
        getActiveMissions(propertyId),
        getFamilyInfo(user.id)
    ]);

    return (
        <OverviewContent
            initialDashboardData={dashboardData}
            attacks={attacks}
            missions={missions}
            family={family}
        />
    );
}
