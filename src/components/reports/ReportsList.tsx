'use client';

import { BattleReport } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Swords } from 'lucide-react';

export default function ReportsList({ reports }: { reports: BattleReport[] }) {
    if (reports.length === 0) {
        return <p className="text-center text-muted-foreground py-8">No hay informes de batalla.</p>;
    }

    return (
        <div className="space-y-4">
            {reports.map(report => (
                <Link key={report.id} href={`/dashboard/reports/${report.id}`} className="block">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Swords className="h-5 w-5 text-red-500" />
                                <div>
                                    <p className="font-bold">
                                        {report.atacante?.nombre_usuario || 'Desconocido'} vs {report.defensor?.nombre_usuario || 'Desconocido'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{new Date(report.fecha).toLocaleString()}</p>
                                </div>
                            </div>
                            <Badge variant={
                                report.resultado === 'atacante_gana' ? 'destructive' :
                                report.resultado === 'defensor_gana' ? 'default' : 'secondary'
                            }>
                                {report.resultado.replace('_', ' ').toUpperCase()}
                            </Badge>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
