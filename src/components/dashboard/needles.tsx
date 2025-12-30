'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useGameState } from '@/components/providers/game-state-provider';
import { Skeleton } from '@/components/ui/skeleton';

export function Needles() {
  const { gameState } = useGameState();

  if (!gameState) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const totalEdificios = gameState.edificios.filter(e => e.nivel > 0).length;
  const totalPuntos = gameState.puntos;

  const stats = [
    { label: "Cantidad de edificios", value: totalEdificios.toString() },
    { label: "Puntos de construcción", value: totalPuntos.toString() },
    { label: "Puntos de entrenamiento", value: "N/A" },
    { label: "Puntos de tropa", value: "N/A" },
    { label: "Ranking", value: "N/A" },
  ];

  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4">
        <CardTitle className="text-lg text-primary-foreground">Agujas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm">
        {stats.map(stat => (
            <div key={stat.label} className="flex justify-between">
                <span>{stat.label}</span>
                <span>{stat.value}</span>
            </div>
        ))}
        <div className="flex justify-between border-t border-black/20 mt-2 pt-2">
            <span>Poder de ataque</span>
            <span>N/A (<Link href="/dashboard/poderataque" className="text-blue-800 hover:underline">Detalles</Link>)</span>
        </div>
        <div className="text-center mt-2">
            <Link href="/dashboard/overview" className="text-blue-800 hover:underline">Visión global</Link>
        </div>
      </CardContent>
    </Card>
  );
}
