'use client';

import { AllianceRequest } from '@/types/alliance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { acceptRequestAction, rejectRequestAction } from '@/lib/actions/alliance';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AllianceAdmin({ requests }: { requests: AllianceRequest[] }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Solicitudes de Ingreso</CardTitle>
                    <CardDescription>Gestiona quién entra a la familia.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No hay solicitudes pendientes.</p>
                    ) : (
                        <div className="space-y-4">
                            {requests.map(req => (
                                <RequestItem key={req.id} request={req} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function RequestItem({ request }: { request: AllianceRequest }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        setLoading(true);
        const res = await acceptRequestAction(request.id);
        setLoading(false);
        if (res.error) toast({ title: 'Error', description: res.error, variant: 'destructive' });
        else toast({ title: 'Aceptado', description: `${request.perfil.nombre_usuario} ahora es miembro.` });
    };

    const handleReject = async () => {
        setLoading(true);
        const res = await rejectRequestAction(request.id);
        setLoading(false);
        if (res.error) toast({ title: 'Error', description: res.error, variant: 'destructive' });
        else toast({ title: 'Rechazado', description: 'Solicitud eliminada.' });
    };

    return (
        <div className="flex items-center justify-between border p-4 rounded-lg">
            <div>
                <p className="font-bold">{request.perfil.nombre_usuario}</p>
                <p className="text-sm text-muted-foreground">Puntos: {request.perfil.puntos_total}</p>
                <p className="text-sm italic mt-1">"{request.mensaje}"</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(request.fecha).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleReject} disabled={loading}>Rechazar</Button>
                <Button size="sm" onClick={handleAccept} disabled={loading}>Aceptar</Button>
            </div>
        </div>
    );
}
