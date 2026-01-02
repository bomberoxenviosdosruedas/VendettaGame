'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, MapPin } from "lucide-react";
import { ColaMisiones } from "@/types/database";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ActiveMissionsListProps {
  missions: ColaMisiones[];
  limit?: number;
  compact?: boolean;
}

export function ActiveMissionsList({ missions, limit, compact = false }: ActiveMissionsListProps) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (missions.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [missions.length]);

  if (!missions || missions.length === 0) {
    if (compact) {
        return (
            <Card className="border-dashed border-stone-300 bg-stone-50/50 shadow-none">
                <CardContent className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <Plane className="w-4 h-4 opacity-50" />
                    <span>Sin misiones activas</span>
                </CardContent>
            </Card>
        )
    }
    return null;
  }

  const displayMissions = limit ? missions.slice(0, limit) : missions;

  return (
    <Card className={cn("border-blue-500/30 bg-blue-950/5", compact && "shadow-sm")}>
      <CardContent className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        <div className="flex items-center gap-2 mb-2">
            <Plane className={cn("text-blue-600", compact ? "w-4 h-4" : "w-5 h-5")} />
            <h3 className={cn("font-bold text-blue-800 dark:text-blue-500", compact ? "text-sm" : "")}>
                Misiones Activas
            </h3>
            <Badge variant="outline" className="ml-auto border-blue-500/50 text-blue-700 dark:text-blue-400">
                {missions.length}
            </Badge>
        </div>
        
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
            {displayMissions.map((mission) => {
                const endTime = new Date(mission.fecha_llegada).getTime();
                const timeLeft = Math.max(0, endTime - now);
                const secondsLeft = Math.floor(timeLeft / 1000);
                
                const hours = Math.floor(secondsLeft / 3600);
                const minutes = Math.floor((secondsLeft % 3600) / 60);
                const seconds = secondsLeft % 60;
                
                const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                const isReturning = false; // Logic for return not yet fully exposed in type or needs parsing

                return (
                    <div key={mission.id} className="bg-card border border-border/50 rounded p-2 flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-center">
                            <Badge variant={isReturning ? "secondary" : "default"} className="text-[10px] px-1 h-5 uppercase">
                                {mission.tipo_mision}
                            </Badge>
                            <span className="text-xs font-mono bg-muted px-1 rounded flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {timeString}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">
                                {mission.destino_ciudad}:{mission.destino_barrio}:{mission.destino_edificio}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
        {limit && missions.length > limit && (
            <div className="text-center text-xs text-muted-foreground pt-1">
                + {missions.length - limit} más...
            </div>
        )}
      </CardContent>
    </Card>
  );
}
