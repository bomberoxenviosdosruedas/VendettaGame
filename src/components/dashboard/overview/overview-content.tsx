'use client';

import { useGameState } from '@/components/providers/game-state-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DashboardData, IncomingAttack, ActiveMission, FamilyInfo } from '@/types/game';
import { ResourceTicker } from './resource-ticker';
import { AlertsWidget } from './alerts-widget';

interface OverviewContentProps {
  initialDashboardData?: DashboardData | null;
  attacks?: IncomingAttack[];
  missions?: ActiveMission[];
  family?: FamilyInfo | null;
}

export function OverviewContent({ initialDashboardData, attacks = [], missions = [], family }: OverviewContentProps) {
  const { gameState } = useGameState();

  // Prefer live state if available, otherwise use server-fetched initial data
  const data = gameState || initialDashboardData;

  if (!data) {
    return <div className="p-4 text-center">Cargando datos del imperio...</div>;
  }

  const { propiedad, recursos, edificios, puntos } = data;

  const resourceList = [
    {
      name: "Armas",
      value: recursos.armas.val,
      max: recursos.armas.max,
      prod: recursos.armas.prod,
      highlight: recursos.armas.val >= recursos.armas.max
    },
    {
      name: "Munición",
      value: recursos.municion.val,
      max: recursos.municion.max,
      prod: recursos.municion.prod,
      highlight: recursos.municion.val >= recursos.municion.max
    },
    {
      name: "Alcohol",
      value: recursos.alcohol.val,
      max: recursos.alcohol.max,
      prod: recursos.alcohol.prod,
      highlight: recursos.alcohol.val >= recursos.alcohol.max
    },
    {
      name: "Dólares",
      value: recursos.dolares.val,
      max: recursos.dolares.max,
      prod: recursos.dolares.prod,
      highlight: recursos.dolares.val >= recursos.dolares.max
    },
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
    <div className="space-y-4">
        <AlertsWidget attacks={attacks} />

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
                                        <ResourceTicker
                                            initialValue={resource.value}
                                            max={resource.max}
                                            productionRate={resource.prod}
                                            lastUpdated={propiedad.ultima_recogida_recursos || new Date().toISOString()}
                                        />
                                        <span className="text-xs text-muted-foreground ml-1">
                                            (max. {resource.max.toLocaleString()})
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {/* Simplified display or same ticker? Keeping static for comparison or simple value */}
                                        {Math.floor(resource.value).toLocaleString()}
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
    </div>
  );
}
