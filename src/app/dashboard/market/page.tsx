import { getMarketOffers, getMyOffers } from '@/lib/actions/market';
import MarketDashboard from '@/components/market/MarketDashboard';

export default async function MarketPage() {
    const [offers, myOffers] = await Promise.all([
        getMarketOffers(),
        getMyOffers()
    ]);

    return <MarketDashboard initialOffers={offers} myOffers={myOffers} />;
}
