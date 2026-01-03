'use client';

import { AllianceData } from '@/types/alliance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { leaveAllianceAction } from '@/lib/actions/alliance';
import { useToast } from '@/hooks/use-toast';
import AllianceMembers from './AllianceMembers';
import AllianceAdmin from './AllianceAdmin';
import AllianceDiplomacy from './AllianceDiplomacy';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AllianceDashboard({ data }: { data: AllianceData }) {
    const { alliance, members, userRank } = data;
    const { toast } = useToast();
    const isAdmin = ['Lider', 'Colider'].includes(userRank || '');
    const [loading, setLoading] = useState(false);

    const handleLeave = async () => {
        setLoading(true);
        const result = await leaveAllianceAction();
        setLoading(false);
        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Saliste de la alianza', description: 'Has abandonado la alianza correctamente.' });
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-3xl">[{alliance.etiqueta}] {alliance.nombre}</CardTitle>
                        <p className="text-muted-foreground mt-2">{alliance.descripcion}</p>
                    </div>
                    {alliance.logo_url && (
                        <img src={alliance.logo_url} alt="Logo" className="w-24 h-24 object-contain" />
                    )}
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <p>Fundada: {new Date(alliance.creado_en).toLocaleDateString()}</p>
                        <p>Miembros: {members.length}</p>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="members" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="members">Miembros</TabsTrigger>
                    <TabsTrigger value="diplomacy">Diplomacia</TabsTrigger>
                    {isAdmin && <TabsTrigger value="admin">Administración</TabsTrigger>}
                </TabsList>

                <TabsContent value="members">
                    <AllianceMembers members={members} userRank={userRank} />
                </TabsContent>

                <TabsContent value="diplomacy">
                    <AllianceDiplomacy wars={data.wars} />
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="admin">
                        <AllianceAdmin requests={data.requests} />
                    </TabsContent>
                )}
            </Tabs>

            <div className="flex justify-end mt-8">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Salir de la Alianza</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Si eres el último miembro, la alianza se disolverá.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeave} disabled={loading}>
                                {loading ? 'Saliendo...' : 'Sí, salir'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
