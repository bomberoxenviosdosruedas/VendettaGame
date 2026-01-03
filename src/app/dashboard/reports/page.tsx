import { getReports } from '@/lib/actions/reports';
import ReportsList from '@/components/reports/ReportsList';

export default async function ReportsPage() {
    const reports = await getReports();

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Informes de Batalla</h2>
            <ReportsList reports={reports} />
        </div>
    );
}
