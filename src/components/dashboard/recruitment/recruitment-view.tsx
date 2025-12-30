'use client';

import { GameStateProvider, useGameState } from "@/components/providers/game-state-provider";
import { DashboardData, ConfiguracionTropa } from "@/types/game";
import { TroopCard } from "./troop-card";
import { RecruitmentQueueList } from "./recruitment-queue-list";

function RecruitmentContent({ troops }: { troops: ConfiguracionTropa[] }) {
    const { gameState } = useGameState();

    if (!gameState) return <div>Cargando...</div>;

    const { propiedad, tropas, cola_reclutamiento, recursos } = gameState;
    const queue = cola_reclutamiento || [];

    // Create a simple resources object from nested structure
    const currentResources = {
        armas: recursos.armas.val,
        municion: recursos.municion.val,
        alcohol: recursos.alcohol.val,
        dolares: recursos.dolares.val,
    };

    return (
        <div className="space-y-4">
            <RecruitmentQueueList queue={queue} />

            <div className="space-y-2">
                {troops.map((troop) => {
                    const myTroop = tropas.find(t => t.id === troop.id);
                    return (
                        <TroopCard
                            key={troop.id}
                            troop={troop}
                            currentAmount={myTroop?.cantidad || 0}
                            resources={currentResources}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function RecruitmentView({ initialData, troops }: { initialData: DashboardData; troops: ConfiguracionTropa[] }) {
    return (
        <GameStateProvider initialData={initialData}>
            <RecruitmentContent troops={troops} />
        </GameStateProvider>
    );
}
