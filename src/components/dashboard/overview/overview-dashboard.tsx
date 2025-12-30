'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DashboardData } from '@/types/game';
import { AtaqueEntrante, ColaMisiones, MiembroFamilia, Familia } from '@/types/database';
import { ResourceTicker } from './resource-ticker';
import { AlertsWidget } from './alerts-widget';

interface OverviewDashboardProps {
    dashboardData: DashboardData | null;
    attacks: AtaqueEntrante[];
    missions: ColaMisiones[];
    familyInfo: { miembro: MiembroFamilia; familia: Familia } | null;
}

export function OverviewDashboard({ dashboardData, attacks, missions, familyInfo }: OverviewDashboardProps) {

  if (!dashboardData) {
    return <div className="p-4 text-center">Cargando datos del imperio...</div>;
  }

  const { propiedad, recursos, edificios, puntos } = dashboardData;

  const resourceList = [
    { name: "Armas", value: recursos.armas.val, max: recursos.armas.max, prod: recursos.armas.prod, highlight: recursos.armas.val >= recursos.armas.max },
    { name: "Munición", value: recursos.municion.val, max: recursos.municion.max, prod: recursos.municion.prod, highlight: recursos.municion.val >= recursos.municion.max },
    { name: "Alcohol", value: recursos.alcohol.val, max: recursos.alcohol.max, prod: recursos.alcohol.prod, highlight: recursos.alcohol.val >= recursos.alcohol.max },
    { name: "Dólares", value: recursos.dolares.val, max: recursos.dolares.max, prod: recursos.dolares.prod, highlight: recursos.dolares.val >= recursos.dolares.max },
  ];

  // Find main building (Oficina del Jefe)
  const mainBuilding = edificios.find(e => e.id === 'oficina_del_jefe');
  const mainBuildingLevel = mainBuilding ? mainBuilding.nivel : 0;
  const mainBuildingName = mainBuilding ? mainBuilding.nombre : "Oficina del Jefe";

  const totalBuildingsLevel = edificios.reduce((acc, curr) => acc + curr.nivel, 0);
  const researchLevel = 0; // Placeholder

  const levels = [
      { name: "Edificios", level: totalBuildingsLevel },
      { name: "Investigación", level: researchLevel }
  ];

  return (
    <div className="space-y-4">
        <AlertsWidget attacks={attacks} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-primary bg-stone-200 text-black overflow-hidden">
                <CardHeader className="bg-primary/80 py-3 px-4">
                    <CardTitle className="text-xl text-primary-foreground flex justify-between">
                        <span>Visión Global {propiedad.nombre}</span>
                        {familyInfo && (
                            <span className="text-sm bg-stone-800 text-stone-200 px-2 py-1 rounded">
                                [{familyInfo.familia.etiqueta}] {familyInfo.familia.nombre}
                            </span>
                        )}
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
                                                productionRate={resource.prod}
                                                // Assuming initialValue is fresh from server render time
                                            />
                                            <span className="text-xs text-gray-500 ml-1">/ {resource.max.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                            +{Math.floor(resource.prod).toLocaleString()}/h
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

            {/* Active Missions Section - Simple list for now */}
            {missions.length > 0 && (
                <Card className="border-stone-400 bg-stone-100">
                     <CardHeader className="bg-stone-300 py-3 px-4">
                        <CardTitle className="text-lg">Misiones Activas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <ul className="space-y-2">
                            {missions.map(m => (
                                <li key={m.id} className="bg-white p-2 rounded shadow-sm flex justify-between">
                                    <span className="capitalize font-semibold">{m.tipo_mision}</span>
                                    <span>Llegada: {new Date(m.fecha_llegada).toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
