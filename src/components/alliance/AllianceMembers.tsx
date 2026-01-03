'use client';

import { AllianceMember } from '@/types/alliance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { kickMemberAction } from '@/lib/actions/alliance';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AllianceMembersProps {
    members: AllianceMember[];
    userRank: 'Lider' | 'Colider' | 'Miembro' | null;
}

export default function AllianceMembers({ members, userRank }: AllianceMembersProps) {
    const isAdmin = ['Lider', 'Colider'].includes(userRank || '');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Miembros de la Alianza</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rango</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Puntos</TableHead>
                            <TableHead>Última Actividad</TableHead>
                            {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <MemberRow key={member.id} member={member} isAdmin={isAdmin} viewerRank={userRank} />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function MemberRow({ member, isAdmin, viewerRank }: { member: AllianceMember, isAdmin: boolean, viewerRank: string | null }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Can kick if admin, and target is lower rank (Lider > Colider > Miembro)
    const canKick = isAdmin &&
                    member.perfil.nombre_usuario !== 'Yo' &&
                    (viewerRank === 'Lider' || (viewerRank === 'Colider' && member.rango === 'Miembro'));

    const handleKick = async () => {
        setLoading(true);
        const result = await kickMemberAction(member.perfil_id);
        setLoading(false);

        if (result.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Miembro expulsado', description: `${member.perfil.nombre_usuario} ha sido expulsado.` });
        }
    };

    return (
        <TableRow>
            <TableCell>
                <Badge variant={member.rango === 'Lider' ? 'default' : member.rango === 'Colider' ? 'secondary' : 'outline'}>
                    {member.rango}
                </Badge>
            </TableCell>
            <TableCell className="font-medium">{member.perfil.nombre_usuario}</TableCell>
            <TableCell>{member.perfil.puntos_total?.toLocaleString()}</TableCell>
            <TableCell>
                {member.perfil.ultimo_activo ? new Date(member.perfil.ultimo_activo).toLocaleDateString() : 'N/A'}
            </TableCell>
            {isAdmin && (
                <TableCell className="text-right">
                    {canKick && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Expulsar</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Expulsar a {member.perfil.nombre_usuario}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        ¿Estás seguro? Esta acción es irreversible.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleKick} disabled={loading}>
                                        {loading ? 'Expulsando...' : 'Expulsar'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </TableCell>
            )}
        </TableRow>
    );
}
