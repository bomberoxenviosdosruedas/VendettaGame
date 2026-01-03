'use client';

import { MarketOffer } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cancelOfferAction } from '@/lib/actions/market';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function MyOffers({ offers }: { offers: MarketOffer[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Ofertas Activas</CardTitle>
                <CardDescription>Gestiona lo que estás vendiendo actualmente.</CardDescription>
            </CardHeader>
            <CardContent>
                {offers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No tienes ofertas activas.</p>
                ) : (
                    <div className="space-y-4">
                        {offers.map(offer => (
                            <MyOfferItem key={offer.id} offer={offer} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function MyOfferItem({ offer }: { offer: MarketOffer }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        setLoading(true);
        const res = await cancelOfferAction(offer.id);
        setLoading(false);
        if (res.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        } else {
            toast({ title: 'Cancelada', description: 'Oferta retirada. Recursos devueltos.' });
        }
    };

    return (
        <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/20">
            <div>
                <p className="font-bold">{offer.cantidad} {offer.recurso.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">Expira: {new Date(offer.expira_en).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right text-xs text-muted-foreground">
                   {offer.pide_armas > 0 && <span>{offer.pide_armas} A </span>}
                   {offer.pide_municion > 0 && <span>{offer.pide_municion} M </span>}
                   {offer.pide_dolares > 0 && <span>{offer.pide_dolares} $ </span>}
                </div>
                <Button variant="destructive" size="sm" onClick={handleCancel} disabled={loading}>
                    Cancelar
                </Button>
            </div>
        </div>
    );
}
