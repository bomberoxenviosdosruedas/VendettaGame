'use client';

import { RankingProfile } from '@/types/ranking';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function RankingTable({ data, total, page, limit }: { data: RankingProfile[], total: number, page: number, limit: number }) {
    const router = useRouter();
    const totalPages = Math.ceil(total / limit);

    const handlePageChange = (newPage: number) => {
        router.push(`/dashboard/ranking?page=${newPage}`);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Clasificación Global
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Pos</TableHead>
                                <TableHead>Jugador</TableHead>
                                <TableHead>Alianza</TableHead>
                                <TableHead className="text-right">Puntos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((player, index) => {
                                const rank = (page - 1) * limit + index + 1;
                                return (
                                    <TableRow key={player.id}>
                                        <TableCell className="font-bold">#{rank}</TableCell>
                                        <TableCell className="font-medium">{player.nombre_usuario}</TableCell>
                                        <TableCell>
                                            {player.alianza ? (
                                                <Badge variant="secondary">[{player.alianza.etiqueta}] {player.alianza.nombre}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">{player.puntos_total.toLocaleString()}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-center gap-2">
                <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => handlePageChange(page - 1)}
                >
                    Anterior
                </Button>
                <span className="flex items-center px-4 text-sm">
                    Página {page} de {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => handlePageChange(page + 1)}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
