'use client';

import { MarketOffer } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createOfferAction } from '@/lib/actions/market';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function CreateOfferForm() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [recurso, setRecurso] = useState('armas');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            recurso: recurso,
            cantidad: parseInt(formData.get('cantidad') as string),
            pide_armas: parseInt(formData.get('pide_armas') as string || '0'),
            pide_municion: parseInt(formData.get('pide_municion') as string || '0'),
            pide_dolares: parseInt(formData.get('pide_dolares') as string || '0'),
        };

        const result = await createOfferAction(data);
        setLoading(false);

        if (result?.error) {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        } else {
            toast({ title: 'Oferta Publicada', description: 'Tu oferta está ahora visible en el mercado.' });
            // Optional: clear form
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Publicar Oferta</CardTitle>
                <CardDescription>Vende tus excedentes de recursos.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>¿Qué vendes?</Label>
                            <Select value={recurso} onValueChange={setRecurso}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="armas">Armas</SelectItem>
                                    <SelectItem value="municion">Munición</SelectItem>
                                    <SelectItem value="alcohol">Alcohol</SelectItem>
                                    <SelectItem value="dolares">Dólares</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input name="cantidad" type="number" min="1" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>¿Qué pides a cambio?</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <Label className="text-xs">Armas</Label>
                                <Input name="pide_armas" type="number" min="0" defaultValue="0" />
                            </div>
                            <div>
                                <Label className="text-xs">Munición</Label>
                                <Input name="pide_municion" type="number" min="0" defaultValue="0" />
                            </div>
                            <div>
                                <Label className="text-xs">Dólares</Label>
                                <Input name="pide_dolares" type="number" min="0" defaultValue="0" />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Publicando...' : 'Crear Oferta'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
