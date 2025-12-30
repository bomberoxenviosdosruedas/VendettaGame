'use client';

import { GameStateProvider, useGameState } from "@/components/providers/game-state-provider";
import { DashboardData } from "@/types/game";
import { recruitmentData } from "@/lib/data/recruitment-data";
import { TroopCard } from "./troop-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function RecruitmentContent() {
    const { gameState } = useGameState();

    if (!gameState) return <div>Cargando...</div>;

    const { propiedad, tropas, cola_reclutamiento } = gameState;
    const queue = cola_reclutamiento || [];

    return (
        <div className="space-y-4">
            <Card className="border-primary bg-stone-200 text-black">
                <CardHeader className="bg-primary/80 py-2 px-4">
                    <CardTitle className="text-lg text-primary-foreground">
                        Cola de Reclutamiento ({queue.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col items-center gap-2">
                     {queue.length > 0 ? (
                        <div className="w-full space-y-2">
                             <Select>
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder={`${queue.length} procesos activos`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {queue.map((item, index) => {
                                        const timeLeft = new Date(item.fecha_fin).getTime() - Date.now();
                                        const secondsLeft = Math.max(0, Math.floor(timeLeft / 1000));
                                        // Simple formatting for HH:MM:SS
                                        const hours = Math.floor(secondsLeft / 3600);
                                        const minutes = Math.floor((secondsLeft % 3600) / 60);
                                        const seconds = secondsLeft % 60;
                                        const timeLeftStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                                        return (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.cantidad} {item.nombre} - {timeLeftStr}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                            <div className="text-xs text-center text-muted-foreground">
                                Próximo en finalizar: {new Date(queue[0].fecha_fin).toLocaleTimeString()}
                            </div>
                        </div>
                     ) : (
                         <p className="text-sm text-gray-500">No hay tropas en entrenamiento.</p>
                     )}
                </CardContent>
            </Card>

            <div className="space-y-2">
                {recruitmentData.map((troop) => {
                    const myTroop = tropas.find(t => t.id === troop.id);
                    return (
                        <TroopCard
                            key={troop.id}
                            troop={troop}
                            propiedadId={propiedad.id}
                            currentAmount={myTroop?.cantidad || 0}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function RecruitmentView({ initialData }: { initialData: DashboardData }) {
    return (
        <GameStateProvider initialData={initialData}>
            <RecruitmentContent />
        </GameStateProvider>
    );
}
