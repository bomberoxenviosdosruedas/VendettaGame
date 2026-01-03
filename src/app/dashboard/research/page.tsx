import { getResearchData } from '@/lib/actions/research';
import ResearchView from '@/components/research/ResearchView';

export default async function ResearchPage() {
    const { technologies, queue } = await getResearchData();

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Laboratorio de I+D</h2>
            <ResearchView technologies={technologies} queue={queue} />
        </div>
    );
}
