import { roomsData } from "@/lib/data/rooms-data";
import { RoomCard } from "@/components/dashboard/rooms/room-card";

export default function RoomsPage() {
  return (
    <div className="space-y-4">
      <div className="bg-primary text-primary-foreground text-center py-2 rounded-sm">
        <h1 className="text-lg font-bold">Habitación</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roomsData.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
