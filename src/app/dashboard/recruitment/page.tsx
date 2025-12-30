import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getUserProperty } from "@/lib/services/game.service";
import { RecruitmentView } from "@/components/dashboard/recruitment/recruitment-view";
import { ConfiguracionTropa } from "@/types/game";

export default async function RecruitmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      return <div>Acceso denegado</div>;
  }

  const propertyId = await getUserProperty(user.id);

  if (!propertyId) {
      return <div>No se encontró propiedad para el usuario.</div>;
  }

  // Run fetches in parallel
  const [dashboardData, troopsData] = await Promise.all([
    getDashboardData(propertyId),
    supabase.from('configuracion_tropa').select('*').order('costo_dolares', { ascending: true })
  ]);

  if (!dashboardData) {
      return <div>Error cargando datos del dashboard.</div>;
  }

  if (troopsData.error) {
    console.error('Error fetching troops:', troopsData.error);
    return <div>Error cargando configuración de tropas.</div>;
  }

  const troops = troopsData.data as ConfiguracionTropa[];

  return <RecruitmentView initialData={dashboardData} troops={troops} />;
}
