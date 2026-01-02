'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Hammer } from "lucide-react";
import { ColaDetalle } from "@/types/game";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ConstructionQueueListProps {
  queue: ColaDetalle[];
  limit?: number;
  compact?: boolean;
}

export function ConstructionQueueList({ queue, limit, compact = false }: ConstructionQueueListProps) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (queue.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [queue.length]);

  if (!queue || queue.length === 0) {
    if (compact) {
        return (
            <Card className="border-dashed border-stone-300 bg-stone-50/50 shadow-none">
                <CardContent className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <Hammer className="w-4 h-4 opacity-50" />
                    <span>Cola de construcción vacía</span>
                </CardContent>
            </Card>
        )
    }
    return null;
  }

  const displayQueue = limit ? queue.slice(0, limit) : queue;

  return (
    <Card className={cn("border-amber-500/30 bg-amber-950/10", compact && "shadow-sm")}>
      <CardContent className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        <div className="flex items-center gap-2 mb-2">
            <Hammer className={cn("text-amber-600", compact ? "w-4 h-4" : "w-5 h-5")} />
            <h3 className={cn("font-bold text-amber-800 dark:text-amber-500", compact ? "text-sm" : "")}>
                Cola de Construcción
            </h3>
            <Badge variant="outline" className="ml-auto border-amber-500/50 text-amber-700 dark:text-amber-400">
                {queue.length} / 5
            </Badge>
        </div>
        
        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5")}>
            {displayQueue.map((item) => {
                const endTime = new Date(item.fecha_fin).getTime();
                const timeLeft = Math.max(0, endTime - now);
                const secondsLeft = Math.floor(timeLeft / 1000);
                
                const hours = Math.floor(secondsLeft / 3600);
                const minutes = Math.floor((secondsLeft % 3600) / 60);
                const seconds = secondsLeft % 60;
                
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                return (
                    <div key={item.id} className="bg-card border border-border/50 rounded p-2 flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className={cn("font-semibold truncate pr-2", compact ? "text-xs" : "text-sm")}>{item.nombre}</span>
                            <span className="text-xs font-mono bg-muted px-1 rounded">{timeString}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Nivel {item.nivel_destino}</span>
                            <Clock className="w-3 h-3" />
                        </div>
                         <Progress value={100} className="h-1 mt-1 animate-pulse" /> 
                    </div>
                );
            })}
        </div>
        {limit && queue.length > limit && (
            <div className="text-center text-xs text-muted-foreground pt-1">
                + {queue.length - limit} más...
            </div>
        )}
      </CardContent>
    </Card>
  );
}
