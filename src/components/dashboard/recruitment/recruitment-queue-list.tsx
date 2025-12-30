'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColaDetalle } from "@/types/game";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface RecruitmentQueueListProps {
  queue: ColaDetalle[];
}

export function RecruitmentQueueList({ queue }: RecruitmentQueueListProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (queue.length === 0) return;

    const interval = setInterval(() => {
      const firstItem = queue[0];
      const end = new Date(firstItem.fecha_fin).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [queue]);

  if (queue.length === 0) {
    return (
      <Card className="border-primary bg-stone-200 text-black">
        <CardHeader className="bg-primary/80 py-2 px-4">
          <CardTitle className="text-lg text-primary-foreground">
            Cola de Reclutamiento (0)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center gap-2">
          <p className="text-sm text-gray-500">No hay tropas en entrenamiento.</p>
        </CardContent>
      </Card>
    );
  }

  // Format time left
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const timeLeftStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">
          Cola de Reclutamiento ({queue.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center gap-2">
        <div className="w-full space-y-2">
          <Select defaultValue={queue[0]?.id}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder={`${queue.length} procesos activos`} />
            </SelectTrigger>
            <SelectContent>
              {queue.map((item, index) => {
                // Determine display string for each item
                // Only the first item is actively processing (usually) in this game logic?
                // Assuming sequential processing.
                const isFirst = index === 0;
                return (
                  <SelectItem key={item.id} value={item.id} disabled={!isFirst}>
                    {item.cantidad} {item.nombre} {isFirst ? `- ${timeLeftStr}` : '(En cola)'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <div className="text-xs text-center text-muted-foreground">
             Finaliza: {new Date(queue[0].fecha_fin).toLocaleTimeString()}
          </div>
          {/* Progress bar could be added here if we knew total duration, but we assume lazy updates or just countdown */}
        </div>
      </CardContent>
    </Card>
  );
}
