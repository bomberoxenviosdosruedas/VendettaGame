'use client';

import { Research, ResearchQueueItem } from '@/types/research';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { startResearchAction } from '@/lib/actions/research';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function ResearchView({ technologies, queue }: { technologies: Research[], queue: ResearchQueueItem[] }) {
    return (
        <div className="space-y-6">
            <ResearchQueue queue={queue} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {technologies.map(tech => (
                    <ResearchCard key={tech.id} tech={tech} />
                ))}
            </div>
        </div>
    );
}

function ResearchQueue({ queue }: { queue: ResearchQueueItem[] }) {
    if (queue.length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Investigación en Curso</CardTitle>
            </CardHeader>
            <CardContent>
                {queue.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b py-2 last:border-0">
                        <span>{item.investigacion_id} (Nivel {item.nivel_destino})</span>
                        <span className="text-sm text-muted-foreground">Fin: {new Date(item.fin).toLocaleTimeString()}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function ResearchCard({ tech }: { tech: Research }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleResearch = async () => {
        setLoading(true);
        const res = await startResearchAction(tech.id);
        setLoading(false);
        if (res?.error) toast({ title: 'Error', description: res.error, variant: 'destructive' });
        else toast({ title: 'Iniciado', description: `Investigando ${tech.nombre}...` });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{tech.nombre}</CardTitle>
                        <CardDescription>Nivel Actual: {tech.nivel}</CardDescription>
                    </div>
                    <Badge variant={tech.nivel > 0 ? 'default' : 'secondary'}>{tech.nivel}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">{tech.descripcion}</p>
                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                    <div className="text-center bg-muted p-1 rounded">
                        <span className="block font-bold">Armas</span>
                        {tech.costo_armas.toLocaleString()}
                    </div>
                    <div className="text-center bg-muted p-1 rounded">
                        <span className="block font-bold">Munición</span>
                        {tech.costo_municion.toLocaleString()}
                    </div>
                    <div className="text-center bg-muted p-1 rounded">
                        <span className="block font-bold">Dólares</span>
                        {tech.costo_dolares.toLocaleString()}
                    </div>
                </div>
                <Button className="w-full" onClick={handleResearch} disabled={loading}>
                    {loading ? '...' : `Investigar (Nivel ${tech.nivel + 1})`}
                </Button>
            </CardContent>
        </Card>
    );
}
