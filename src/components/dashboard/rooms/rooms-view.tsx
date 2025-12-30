'use client';

import { GameStateProvider, useGameState } from "@/components/providers/game-state-provider";
import { DashboardData } from "@/types/game";
import { roomsData } from "@/lib/data/rooms-data";
import { RoomCard } from "./room-card";

// Inner component that consumes hook
function RoomsContent() {
    const { gameState } = useGameState();

    if (!gameState) return <div>Cargando...</div>;

    const { propiedad, edificios, colas } = gameState;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6">
        {roomsData.map((room) => {
            // Find dynamic data
            // Match room.id with edificios.id
            const edificio = edificios.find(e => e.id === room.id);
            // Match room.id with colas.construccion.habitacion_id
            const construction = colas.construccion.find(c => c.habitacion_id === room.id);

            return (
              <RoomCard
                key={room.id}
                room={room}
                propiedadId={propiedad.id}
                dynamicLevel={edificio?.nivel || 0}
                construction={construction}
              />
            );
        })}
      </div>
    );
}

export function RoomsView({ initialData }: { initialData: DashboardData }) {
    return (
        <GameStateProvider initialData={initialData}>
            <div className="space-y-4 md:space-y-6">
                <div className="bg-primary text-primary-foreground text-center py-3 rounded-sm shadow-sm">
                    <h1 className="text-xl md:text-2xl font-bold tracking-wide">Gestión de Habitaciones</h1>
                </div>
                <RoomsContent />
            </div>
        </GameStateProvider>
    );
}
