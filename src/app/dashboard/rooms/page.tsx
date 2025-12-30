import { roomsData } from "@/lib/data/rooms-data";
import { RoomCard } from "@/components/dashboard/rooms/room-card";

export default function RoomsPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-primary text-primary-foreground text-center py-3 rounded-sm shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Gestión de Habitaciones</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
        {roomsData.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
