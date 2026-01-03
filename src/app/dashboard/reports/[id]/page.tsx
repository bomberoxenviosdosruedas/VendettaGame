import { getReportDetail } from '@/lib/actions/reports';
import ReportDetail from '@/components/reports/ReportDetail';
import { notFound } from 'next/navigation';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const report = await getReportDetail(id);

    if (!report) {
        notFound();
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <ReportDetail report={report} />
        </div>
    );
}
