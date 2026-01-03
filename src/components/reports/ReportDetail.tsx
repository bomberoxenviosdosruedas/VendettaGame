'use client';

import { BattleReport } from '@/types/reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ReportDetail({ report }: { report: BattleReport }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Informe de Batalla</CardTitle>
                        <Badge variant="outline">{new Date(report.fecha).toLocaleString()}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-red-500">{report.atacante?.nombre_usuario || 'Atacante'}</span>
                        <span>VS</span>
                        <span className="text-blue-500">{report.defensor?.nombre_usuario || 'Defensor'}</span>
                    </div>

                    <div className="bg-muted p-4 rounded text-center">
                        <p className="font-bold text-xl uppercase mb-2">{report.resultado.replace('_', ' ')}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Puntos Ganados (Atacante)</p>
                                <p>{report.puntos_ganados_atacante}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Puntos Ganados (Defensor)</p>
                                <p>{report.puntos_ganados_defensor}</p>
                            </div>
                        </div>
                    </div>

                    {report.recursos_robados && (
                        <div className="border p-4 rounded">
                            <h4 className="font-bold mb-2">Botín</h4>
                            <div className="grid grid-cols-4 gap-2 text-sm text-center">
                                <div>
                                    <p className="font-bold">Armas</p>
                                    <p>{report.recursos_robados.armas}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Munición</p>
                                    <p>{report.recursos_robados.municion}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Alcohol</p>
                                    <p>{report.recursos_robados.alcohol}</p>
                                </div>
                                <div>
                                    <p className="font-bold">Dólares</p>
                                    <p>{report.recursos_robados.dolares}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed logs could be rendered here recursively or as text */}
                    {report.detalle_log && (
                        <div className="mt-4">
                            <h4 className="font-bold mb-2">Detalle de Combate</h4>
                            <pre className="bg-black text-white p-4 rounded text-xs overflow-auto max-h-64">
                                {JSON.stringify(report.detalle_log, null, 2)}
                            </pre>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
