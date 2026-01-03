'use client';

import { sendFleetAction } from '@/lib/actions/fleet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function MissionPlanner({ troops }: { troops: any[] }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [mision, setMision] = useState('atacar');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        // Build troops object dynamically
        const selectedTroops: Record<string, number> = {};
        troops.forEach(t => {
            const qty = parseInt(formData.get(`tropa_${t.tropa_id}`) as string || '0');
            if (qty > 0) selectedTroops[t.tropa_id] = qty;
        });

        if (Object.keys(selectedTroops).length === 0) {
            toast({ title: 'Error', description: 'Selecciona al menos una tropa.', variant: 'destructive' });
            setLoading(false);
            return;
        }

        const data = {
            destino_x: parseInt(formData.get('x') as string),
            destino_y: parseInt(formData.get('y') as string),
            destino_z: parseInt(formData.get('z') as string),
            mision,
            tropas: selectedTroops
        };

        const res = await sendFleetAction(data);
        setLoading(false);

        if (res?.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        } else {
            toast({ title: 'Flota enviada', description: 'Tus tropas están en camino.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Planificador de Misiones</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Coordinates */}
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label>X</Label>
                            <Input name="x" type="number" required min="1" max="50" />
                        </div>
                        <div>
                            <Label>Y</Label>
                            <Input name="y" type="number" required min="1" max="50" />
                        </div>
                        <div>
                            <Label>Z</Label>
                            <Input name="z" type="number" required min="1" max="255" />
                        </div>
                    </div>

                    {/* Mission Type */}
                    <div className="space-y-2">
                        <Label>Misión</Label>
                        <Select value={mision} onValueChange={setMision}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="atacar">Atacar</SelectItem>
                                <SelectItem value="transportar">Transportar</SelectItem>
                                <SelectItem value="espiar">Espiar</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Troops Selection */}
                    <div className="space-y-2">
                        <Label>Tropas Disponibles</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {troops.map(t => (
                                <div key={t.tropa_id} className="flex flex-col">
                                    <Label className="text-xs mb-1">{t.configuracion_tropas.nombre} (Max: {t.cantidad})</Label>
                                    <Input
                                        name={`tropa_${t.tropa_id}`}
                                        type="number"
                                        min="0"
                                        max={t.cantidad}
                                        placeholder="0"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Calculando...' : 'Enviar Flota'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
