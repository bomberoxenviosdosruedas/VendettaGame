'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Hammer } from "lucide-react";
import { ColaDetalle } from "@/types/game";
import { useEffect, useState } from "react";

interface ConstructionQueueListProps {
  queue: ColaDetalle[];
}

export function ConstructionQueueList({ queue }: ConstructionQueueListProps) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (queue.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [queue.length]);

  if (!queue || queue.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500/30 bg-amber-950/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
            <Hammer className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-800 dark:text-amber-500">Cola de Construcción</h3>
            <Badge variant="outline" className="ml-auto border-amber-500/50 text-amber-700 dark:text-amber-400">
                {queue.length} / 5
            </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {queue.map((item) => {
                const endTime = new Date(item.fecha_fin).getTime();
                // Assuming start time is not available in ColaDetalle, we can verify this later.
                // For now, let's just show time remaining.
                const timeLeft = Math.max(0, endTime - now);
                const secondsLeft = Math.floor(timeLeft / 1000);
                
                const hours = Math.floor(secondsLeft / 3600);
                const minutes = Math.floor((secondsLeft % 3600) / 60);
                const seconds = secondsLeft % 60;
                
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                return (
                    <div key={item.id} className="bg-card border border-border/50 rounded p-2 flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-sm truncate pr-2">{item.nombre}</span>
                            <span className="text-xs font-mono bg-muted px-1 rounded">{timeString}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Nivel {item.nivel_destino}</span>
                            <Clock className="w-3 h-3" />
                        </div>
                        {/* We don't have total duration to calculate progress percentage accurately without knowing start time. 
                            If we want a progress bar, we need to know when it started or total duration. 
                            For now, maybe just a visual indicator that it is active. 
                        */}
                         <Progress value={100} className="h-1 mt-1 animate-pulse" /> 
                    </div>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
