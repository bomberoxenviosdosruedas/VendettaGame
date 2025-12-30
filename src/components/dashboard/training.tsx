'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameState } from '@/components/providers/game-state-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function Training() {
  const { gameState } = useGameState();

  if (!gameState) {
    return <Skeleton className="h-[100px] w-full" />;
  }

  // Active research queues
  const activeResearch = gameState.colas.investigacion;
  // Completed research count
  const completedResearchCount = gameState.investigaciones ? gameState.investigaciones.length : 0;

  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4 flex-row items-center justify-between">
        <CardTitle className="text-lg text-primary-foreground">Capacitación</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-center">
        {activeResearch && activeResearch.length > 0 ? (
           <div className="space-y-2">
             {activeResearch.map(queue => (
               <div key={queue.id} className="text-sm border-b border-black/10 pb-1 last:border-0">
                 <div className="font-semibold">{queue.nombre}</div>
                 <div className="text-xs text-muted-foreground">Nivel {queue.nivel_destino}</div>
                 {/* <div className="text-xs text-blue-700">{formatTimeRemaining(queue.fecha_fin)}</div> */}
               </div>
             ))}
           </div>
        ) : (
          <div className="space-y-1">
             <p className="text-sm text-muted-foreground">-</p>
             {completedResearchCount > 0 && (
                 <p className="text-xs text-stone-600 mt-2">{completedResearchCount} investigaciones completadas</p>
             )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
