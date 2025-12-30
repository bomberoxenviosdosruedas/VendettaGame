'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useGameState } from '@/components/providers/game-state-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function Troops() {
  const { gameState } = useGameState();

  if (!gameState) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const { tropas } = gameState;

  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">Tropas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2 text-center">
        <Link href="/dashboard/troops" className="block hover:underline text-sm text-blue-800">
          Visión global de las tropas
        </Link>
        <Link href="/dashboard/missions" className="block hover:underline text-sm text-blue-800">
          Visión global de las Misiones
        </Link>

        <div className="mt-4 text-left">
          {tropas && tropas.length > 0 ? (
            <div className="space-y-1">
              {tropas.map(tropa => (
                <div key={tropa.id} className="flex justify-between text-sm">
                  <span>{tropa.nombre}</span>
                  <span className="font-bold">{tropa.cantidad.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center text-muted-foreground">Sin unidad</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
