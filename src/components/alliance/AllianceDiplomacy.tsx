'use client';

import { AllianceWar } from '@/types/alliance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AllianceDiplomacy({ wars }: { wars: AllianceWar[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sala de Guerra</CardTitle>
                <CardDescription>Conflictos activos y diplomacia.</CardDescription>
            </CardHeader>
            <CardContent>
                {wars.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No hay guerras activas en este momento.</p>
                        <p className="text-sm">La paz reina... por ahora.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {wars.map(war => (
                            <div key={war.id} className="border p-4 rounded bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                                <div className="flex justify-between items-center mb-2">
                                    <Badge variant="destructive">GUERRA</Badge>
                                    <span className="text-xs text-muted-foreground">Inicio: {new Date(war.fecha_inicio).toLocaleDateString()}</span>
                                </div>
                                <p className="font-bold text-lg">vs. {war.alianza_enemiga?.nombre || 'Enemigo Desconocido'}</p>
                                <p className="text-sm italic my-2">"{war.declaracion}"</p>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="text-center">
                                        <p className="font-bold text-red-600">Pérdidas Propias</p>
                                        <p>{war.puntos_perdidos_alianza1.toLocaleString()}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-green-600">Pérdidas Enemigas</p>
                                        <p>{war.puntos_perdidos_alianza2.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
