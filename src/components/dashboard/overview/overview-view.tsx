'use client';

import { useGameState } from '@/components/providers/game-state-provider';
import { MiembroFamilia, Familia } from '@/types/database';
import { ConstructionQueueList } from '../rooms/construction-queue-list';
import { ActiveMissionsList } from '../missions/active-missions-list';
import { AlertsWidget } from './alerts-widget';
import { QuickActions } from './quick-actions';
import { ResourceTicker } from './resource-ticker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, Users } from 'lucide-react';

interface OverviewViewProps {
  familyInfo: { miembro: MiembroFamilia; familia: Familia } | null;
}

export function OverviewView({ familyInfo }: OverviewViewProps) {
  const { gameState } = useGameState();

  if (!gameState) {
    return <div className="p-4 text-center">Cargando datos del imperio...</div>;
  }

  const { propiedad, recursos, edificios, puntos, incoming_attacks, cola_misiones, tropa_usuario } = gameState;
  const attacks = incoming_attacks || [];
  const missions = cola_misiones || [];
  
  // Ensure we handle colas correctly. gameState.colas can be null if not populated, but types say it's there.
  // Based on DashboardData type, 'colas' is mandatory but sub-arrays can be empty.
  const construction = gameState.colas?.construccion || [];

  const resourceList = [
    { name: "Armas", value: recursos.armas.val, max: recursos.armas.max, prod: recursos.armas.prod },
    { name: "Munición", value: recursos.municion.val, max: recursos.municion.max, prod: recursos.municion.prod },
    { name: "Alcohol", value: recursos.alcohol.val, max: recursos.alcohol.max, prod: recursos.alcohol.prod },
    { name: "Dólares", value: recursos.dolares.val, max: recursos.dolares.max, prod: recursos.dolares.prod },
  ];

  // Main building logic (Oficina del Jefe)
  const mainBuilding = edificios.find(e => e.id === 'oficina_del_jefe');
  
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header: Resources & Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {resourceList.map((res) => (
             <Card key={res.name} className="bg-card shadow-sm border-l-4 border-l-primary">
                 <CardContent className="p-4 pb-2">
                     <div className="text-xs text-muted-foreground uppercase font-bold">{res.name}</div>
                     <div className="text-2xl font-bold font-mono my-1">
                        <ResourceTicker initialValue={res.value} productionRate={res.prod} className="text-foreground" />
                     </div>
                     <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Cap: {(res.max / 1000).toFixed(0)}k</span>
                        <span className="text-green-600 font-medium">+{Math.floor(res.prod)}/h</span>
                     </div>
                 </CardContent>
             </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Actions & Queues) */}
        <div className="lg:col-span-3 space-y-6">
            <QuickActions />
            <ConstructionQueueList queue={construction} limit={3} compact={true} />
        </div>

        {/* Center Column (Empire Status) */}
        <div className="lg:col-span-6 space-y-6">
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-lg">
                        <span className="flex items-center gap-2">
                            {propiedad.nombre}
                        </span>
                        <Badge variant="secondary" className="font-mono text-xs">
                            {propiedad.coordenada_ciudad}:{propiedad.coordenada_barrio}:{propiedad.coordenada_edificio}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted/30 border rounded-lg hover:bg-muted/50 transition-colors">
                            <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <div className="text-3xl font-bold">{mainBuilding?.nivel || 0}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase mt-1">Nivel Base</div>
                        </div>
                        <div className="p-4 bg-muted/30 border rounded-lg hover:bg-muted/50 transition-colors">
                            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <div className="text-3xl font-bold">{tropa_usuario?.reduce((acc: number, t: any) => acc + t.cantidad, 0) || 0}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase mt-1">Tropas</div>
                        </div>
                        <div className="p-4 bg-muted/30 border rounded-lg hover:bg-muted/50 transition-colors">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                            <div className="text-3xl font-bold">{Math.floor(puntos).toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase mt-1">Puntos</div>
                        </div>
                    </div>
                    
                    {familyInfo && (
                        <div className="p-4 border rounded-md bg-stone-50/80 dark:bg-stone-900/50 flex justify-between items-center">
                            <div>
                                <div className="text-xs text-muted-foreground font-bold uppercase mb-1">Familia</div>
                                <div className="font-bold text-lg">{familyInfo.familia?.nombre}</div>
                            </div>
                            <Badge className="text-lg px-3 py-1 font-mono">[{familyInfo.familia?.etiqueta}]</Badge>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>

        {/* Right Column (Alerts & Missions) */}
        <div className="lg:col-span-3 space-y-6">
            <AlertsWidget attacks={attacks} />
            <ActiveMissionsList missions={missions} limit={5} compact={true} />
        </div>
      </div>
    </div>
  );
}
