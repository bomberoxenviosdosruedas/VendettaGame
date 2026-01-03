import { getRanking } from '@/lib/actions/ranking';
import RankingTable from '@/components/ranking/RankingTable';

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = 50;

    const { data, total } = await getRanking(page, limit);

    return (
        <div className="container mx-auto p-4">
            <RankingTable data={data} total={total} page={page} limit={limit} />
        </div>
    );
}
