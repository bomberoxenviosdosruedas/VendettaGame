'use client';

import { useGameState } from '@/components/providers/game-state-provider';
import { cancelConstructionAction } from '@/actions/game.actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useOptimistic, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ColaDetalle } from '@/types/game';

export function BuildingsContent() {
  const { gameState } = useGameState();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Optimistic State for Construction Queue
  const [optimisticQueue, removeOptimisticItem] = useOptimistic(
    gameState?.colas.construccion || [],
    (state, queueId: string) => state.filter((item) => item.id !== queueId)
  );

  if (!gameState) {
    return <div className="p-4 text-center">Cargando gestión de edificios...</div>;
  }

  const { propiedad } = gameState;
  const queues = optimisticQueue;

  const handleCancel = (queueId: string) => {
    startTransition(async () => {
      // Optimistic update
      removeOptimisticItem(queueId);

      // Server Action
      const result = await cancelConstructionAction(queueId);

      if (!result.success) {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error,
        });
        // Note: useOptimistic automatically reverts if we don't update state via other means,
        // but since we are relying on revalidatePath in Server Action or Realtime,
        // a failure implies the data won't change on server, so next render might show it again (correct).
      } else {
        toast({
            title: "Construcción cancelada",
            description: result.message,
        });
      }
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.max(0, Math.floor((date.getTime() - now.getTime()) / 1000));

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mock property list row (since we only have 1 property currently in dashboard context)
  // In a multi-property view, we would map over properties.
  // Here we show the current property as the "active" one being managed.

  return (
    <Card className="border-primary bg-stone-200 text-black">
        <CardHeader className="bg-primary/80 py-3 px-4">
            <CardTitle className="text-xl text-primary-foreground">
                Gestión de Edificios y Colas
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 pt-1">
                Monitorea el estado de tus edificios. Actualizaciones de construcción en tiempo real.
            </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
            {/* Vista de tabla para pantallas grandes */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-primary/70 hover:bg-primary/70">
                            <TableHead className="text-primary-foreground">Coordenadas</TableHead>
                            <TableHead className="text-primary-foreground">Nombre</TableHead>
                            <TableHead className="text-primary-foreground">Cola de Construcción</TableHead>
                            <TableHead className="text-primary-foreground">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="bg-stone-200 hover:bg-stone-300/60">
                            <TableCell className="font-medium text-red-600">
                                [{propiedad.coordenada_ciudad}:{propiedad.coordenada_barrio}:{propiedad.coordenada_edificio}]
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-2">
                                    <span>{propiedad.nombre}</span>
                                    <div className="flex gap-1">
                                        <Input defaultValue="Renombrar" className="h-8 text-xs w-28" disabled />
                                        <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Renombrar</Button>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {queues.length === 0 ? (
                                    <span className="text-stone-500 italic">Sin construcciones en curso</span>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {queues.map((item) => (
                                            <div key={item.id} className="flex items-center gap-2 text-sm">
                                                <span className="text-red-600 font-semibold">
                                                    {item.nombre} (Niv. {item.nivel_destino})
                                                </span>
                                                <span className="font-mono text-xs">
                                                    {formatTime(item.fecha_fin)}
                                                </span>
                                                <button
                                                    onClick={() => handleCancel(item.id)}
                                                    disabled={isPending}
                                                    className="text-red-600 hover:underline text-xs font-bold"
                                                >
                                                    [X] Cancelar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <Button variant="destructive" size="sm" className="bg-accent hover:bg-accent/90">Gestionar</Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>

            {/* Vista de tarjetas para pantallas pequeñas */}
            <div className="md:hidden p-4 space-y-4">
                <div className="bg-stone-300/60 p-4 rounded-lg border border-primary/30 space-y-3">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-muted-foreground">Coordenadas</p>
                            <p className="font-medium text-red-600">
                                [{propiedad.coordenada_ciudad}:{propiedad.coordenada_barrio}:{propiedad.coordenada_edificio}]
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" className="bg-accent hover:bg-accent/90">Gestionar</Button>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre</p>
                        <div className="flex flex-col gap-2 mt-1">
                            <span>{propiedad.nombre}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Cola de Construcción</p>
                        <div className="flex flex-col mt-1 gap-2">
                            {queues.length === 0 ? (
                                <span className="text-stone-500 italic text-sm">Sin construcciones en curso</span>
                            ) : (
                                queues.map((item) => (
                                    <div key={item.id} className="flex flex-col">
                                        <span className="text-red-600 font-semibold text-sm">
                                            {item.nombre} (Niv. {item.nivel_destino})
                                        </span>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs">{formatTime(item.fecha_fin)}</span>
                                            <button
                                                onClick={() => handleCancel(item.id)}
                                                disabled={isPending}
                                                className="text-red-600 hover:underline text-xs"
                                            >
                                                [X] Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
