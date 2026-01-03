'use client';

import { MarketOffer } from '@/types/market';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateOfferForm from './CreateOfferForm';
import MarketList from './MarketList';
import MyOffers from './MyOffers';

interface MarketDashboardProps {
    initialOffers: MarketOffer[];
    myOffers: MarketOffer[];
}

export default function MarketDashboard({ initialOffers, myOffers }: MarketDashboardProps) {
    return (
        <div className="container mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Mercado Negro</h2>

            <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="buy">Comprar</TabsTrigger>
                    <TabsTrigger value="sell">Vender</TabsTrigger>
                    <TabsTrigger value="mine">Mis Ofertas</TabsTrigger>
                </TabsList>

                <TabsContent value="buy">
                    <MarketList initialOffers={initialOffers} />
                </TabsContent>

                <TabsContent value="sell">
                    <CreateOfferForm />
                </TabsContent>

                <TabsContent value="mine">
                    <MyOffers offers={myOffers} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
