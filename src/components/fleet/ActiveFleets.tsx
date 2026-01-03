'use client';

import { FleetMovement } from '@/types/fleet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane } from 'lucide-react';

export default function ActiveFleets({ movements }: { movements: FleetMovement[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Flotas en Vuelo
                </CardTitle>
            </CardHeader>
            <CardContent>
                {movements.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No hay flotas activas.</p>
                ) : (
                    <div className="space-y-4">
                        {movements.map(m => (
                            <div key={m.id} className="border p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Badge>{m.tipo_mision.toUpperCase()}</Badge>
                                        <span className="font-bold">
                                            {m.destino_x}:{m.destino_y}:{m.destino_z}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">Llegada: {new Date(m.llegada).toLocaleString()}</p>
                                </div>
                                {/* Could add timer here */}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
