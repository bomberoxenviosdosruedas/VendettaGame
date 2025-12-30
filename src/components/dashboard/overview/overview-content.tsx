'use client';

import { useGameState } from '@/components/providers/game-state-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export function OverviewContent() {
  const { gameState } = useGameState();

  if (!gameState) {
    return <div className="p-4 text-center">Cargando datos del imperio...</div>;
  }

  const { propiedad, recursos, edificios, puntos } = gameState;

  const resourceList = [
    { name: "Armas", value: recursos.armas.val, max: recursos.armas.max, highlight: recursos.armas.val >= recursos.armas.max },
    { name: "Munición", value: recursos.municion.val, max: recursos.municion.max, highlight: recursos.municion.val >= recursos.municion.max },
    { name: "Alcohol", value: recursos.alcohol.val, max: recursos.alcohol.max, highlight: recursos.alcohol.val >= recursos.alcohol.max },
    { name: "Dólares", value: recursos.dolares.val, max: recursos.dolares.max, highlight: recursos.dolares.val >= recursos.dolares.max },
  ];

  // Find main building (Oficina del Jefe)
  const mainBuilding = edificios.find(e => e.id === 'oficina_del_jefe');
  const mainBuildingLevel = mainBuilding ? mainBuilding.nivel : 0;
  const mainBuildingName = mainBuilding ? mainBuilding.nombre : "Oficina del Jefe";

  // Calculate stats (Mock logic based on available data)
  const totalBuildingsLevel = edificios.reduce((acc, curr) => acc + curr.nivel, 0);

  // Research levels are not in 'edificios'. They are in 'entrenamiento_usuario' table, not fetched in RPC currently except if I added it.
  // The RPC only fetches 'edificios'. The prompt didn't ask for research levels in DashboardData explicitly but Overview had it.
  // I'll skip research level summary for now or use a placeholder/0.
  const researchLevel = 0;

  const levels = [
      { name: "Edificios", level: totalBuildingsLevel },
      { name: "Investigación", level: researchLevel }
  ];

  return (
    <Card className="border-primary bg-stone-200 text-black overflow-hidden">
        <CardHeader className="bg-primary/80 py-3 px-4">
            <CardTitle className="text-xl text-primary-foreground">
                Visión Global {propiedad.nombre}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableBody>
                        <TableRow className="bg-primary/70 hover:bg-primary/70">
                            <TableHead className="text-primary-foreground font-bold">{mainBuildingName}</TableHead>
                            <TableHead className="text-primary-foreground font-bold text-center">Nivel {mainBuildingLevel}</TableHead>
                            <TableHead className="text-primary-foreground font-bold text-center">=</TableHead>
                        </TableRow>
                        {resourceList.map((resource, index) => (
                            <TableRow key={index} className="bg-stone-200 hover:bg-stone-300/60">
                                <TableCell className="font-semibold">{resource.name}</TableCell>
                                <TableCell className={cn("text-center font-semibold", resource.highlight && "text-red-600")}>
                                    {Math.floor(resource.value).toLocaleString()} (max. {resource.max.toLocaleString()})
                                </TableCell>
                                <TableCell className="text-center">
                                    {Math.floor(resource.value).toLocaleString()} (max. {resource.max.toLocaleString()})
                                </TableCell>
                            </TableRow>
                        ))}
                        {levels.map((item, index) => (
                            <TableRow key={index} className="bg-stone-200 hover:bg-stone-300/60">
                                <TableCell className="font-semibold">{item.name}</TableCell>
                                <TableCell className="text-center font-bold">{item.level}</TableCell>
                                <TableCell className="text-center">{item.level}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="bg-stone-200 hover:bg-stone-300/60">
                            <TableCell className="font-semibold">Puntos</TableCell>
                            <TableCell className="text-center font-bold">{Math.floor(puntos).toLocaleString()}</TableCell>
                            <TableCell className="text-center">{Math.floor(puntos).toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
