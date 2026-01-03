import { getAllianceData } from '@/lib/actions/alliance';
import { NoAllianceView } from '@/components/alliance/NoAllianceView';
import AllianceDashboard from '@/components/alliance/AllianceDashboard';

export default async function AlliancePage() {
    const allianceData = await getAllianceData();

    if (!allianceData) {
        return <NoAllianceView />;
    }

    return <AllianceDashboard data={allianceData} />;
}
