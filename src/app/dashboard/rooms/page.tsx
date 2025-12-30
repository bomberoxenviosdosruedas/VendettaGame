import { createClient } from "@/lib/supabase/server";
import { getDashboardData, getUserProperty } from "@/lib/services/game.service";
import { RoomsView } from "@/components/dashboard/rooms/rooms-view";

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      return <div>Acceso denegado</div>;
  }

  const propertyId = await getUserProperty(user.id);

  if (!propertyId) {
      return <div>No se encontró propiedad para el usuario.</div>;
  }

  const dashboardData = await getDashboardData(propertyId);

  if (!dashboardData) {
      return <div>Error cargando datos.</div>;
  }

  return <RoomsView initialData={dashboardData} />;
}
