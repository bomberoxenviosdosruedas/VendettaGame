'use client';

interface ProductionRow {
    level: number;
    production_hourly: number;
    resource_type: string | null;
}

interface ProductionTableProps {
    projection: ProductionRow[];
    currentLevel: number;
}

export default function ProductionTable({ projection, currentLevel }: ProductionTableProps) {
    if (!projection || projection.length === 0) {
        return null;
    }

    // Determine resource name from first row if available, or generic
    const resourceName = projection[0].resource_type
        ? projection[0].resource_type.charAt(0).toUpperCase() + projection[0].resource_type.slice(1)
        : 'Recursos';

    return (
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 mt-6">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Proyección de Producción</h3>
            </div>

            <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
                    <tr>
                        <th className="px-6 py-3">Nivel</th>
                        <th className="px-6 py-3 text-right">Producción / Hora ({resourceName})</th>
                        <th className="px-6 py-3 text-right">Diferencia</th>
                    </tr>
                </thead>
                <tbody>
                    {projection.map((row, index) => {
                        const isCurrent = row.level === currentLevel;
                        const prevRow = index > 0 ? projection[index - 1] : null;
                        const diff = prevRow ? row.production_hourly - prevRow.production_hourly : 0;

                        return (
                            <tr
                                key={row.level}
                                className={`border-b border-slate-700/50 last:border-0 ${isCurrent ? 'bg-blue-900/20' : 'hover:bg-slate-700/20'}`}
                            >
                                <td className="px-6 py-3 font-medium">
                                    {row.level} {isCurrent && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Actual</span>}
                                </td>
                                <td className="px-6 py-3 text-right font-mono text-white">
                                    {row.production_hourly.toLocaleString()}
                                </td>
                                <td className="px-6 py-3 text-right font-mono text-green-400">
                                    {index > 0 && `+${diff.toLocaleString()}`}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
