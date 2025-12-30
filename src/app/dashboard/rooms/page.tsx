import { roomsData } from "@/lib/data/rooms-data";
import { RoomCard } from "@/components/dashboard/rooms/room-card";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function RoomsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // If there is no user, we might want to redirect, but for now we assume middleware handles protection
  // or we render nothing.
  if (!user) {
    return null;
  }

  const { data: propiedad } = await supabase
    .from('propiedad')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (!propiedad) {
      // Handle case where user has no property yet (maybe onboarding incomplete)
      return <div>No property found.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-primary text-primary-foreground text-center py-2 rounded-sm">
        <h1 className="text-lg font-bold">Habitación</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roomsData.map((room) => (
          <RoomCard key={room.id} room={room} propiedadId={propiedad.id} />
        ))}
      </div>
    </div>
  );
}
