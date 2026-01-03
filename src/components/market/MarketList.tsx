'use client';

import { MarketOffer } from '@/types/market';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buyOfferAction } from '@/lib/actions/market';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { getMarketOffers } from '@/lib/actions/market';
import { useRouter } from 'next/navigation';

export default function MarketList({ initialOffers }: { initialOffers: MarketOffer[] }) {
    const [offers, setOffers] = useState(initialOffers);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFilterChange = async (val: string) => {
        setFilter(val);
        setLoading(true);
        const data = await getMarketOffers(val);
        setOffers(data);
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ofertas Disponibles</CardTitle>
                    <CardDescription>Compra recursos de otros jugadores.</CardDescription>
                </div>
                <div className="w-[180px]">
                    <Select value={filter} onValueChange={handleFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="armas">Armas</SelectItem>
                            <SelectItem value="municion">Munición</SelectItem>
                            <SelectItem value="alcohol">Alcohol</SelectItem>
                            <SelectItem value="dolares">Dólares</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Cargando...</p>
                ) : offers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay ofertas disponibles.</p>
                ) : (
                    <div className="space-y-4">
                        {offers.map(offer => (
                            <OfferItem key={offer.id} offer={offer} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function OfferItem({ offer }: { offer: MarketOffer }) {
    const { toast } = useToast();
    const [buying, setBuying] = useState(false);

    const handleBuy = async () => {
        setBuying(true);
        const res = await buyOfferAction(offer.id);
        setBuying(false);
        if (res.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        } else {
            toast({ title: 'Compra realizada', description: 'Has adquirido los recursos.' });
        }
    };

    return (
        <div className="flex items-center justify-between border p-4 rounded-lg">
            <div className="flex flex-col">
                <span className="font-bold text-lg">
                    {offer.cantidad.toLocaleString()} {offer.recurso.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                    Vendedor: {offer.vendedor?.nombre_usuario || 'Desconocido'}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                    <p className="font-semibold text-muted-foreground">Pide:</p>
                    {offer.pide_armas > 0 && <p>{offer.pide_armas} Armas</p>}
                    {offer.pide_municion > 0 && <p>{offer.pide_municion} Munición</p>}
                    {offer.pide_dolares > 0 && <p>{offer.pide_dolares} $</p>}
                </div>
                <Button onClick={handleBuy} disabled={buying}>
                    {buying ? '...' : 'Comprar'}
                </Button>
            </div>
        </div>
    );
}
