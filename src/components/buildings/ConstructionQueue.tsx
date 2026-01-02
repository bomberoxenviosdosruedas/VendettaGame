'use client';

import { useTransition } from 'react';
import { cancelBuildingUpgrade } from '@/lib/actions/buildings';
import { ConstructionQueueItem } from '@/types/legacy_schema';

interface ConstructionQueueProps {
  queue: ConstructionQueueItem[];
}

export default function ConstructionQueue({ queue }: ConstructionQueueProps) {
  const [isPending, startTransition] = useTransition();

  const handleCancel = (queueId: string) => {
    if (confirm('¿Cancelar esta construcción? Se reembolsarán los recursos.')) {
        startTransition(async () => {
            const result = await cancelBuildingUpgrade(queueId);
            if (result.error) alert(result.error);
        });
    }
  };

  if (!queue || queue.length === 0) {
    return <div className="p-4 bg-slate-800 rounded-lg text-slate-400 text-center text-sm">Cola de construcción vacía</div>;
  }

  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 font-semibold text-slate-200 text-sm">
        Cola de Construcción ({queue.length}/5)
      </div>
      <table className="w-full text-sm text-left text-slate-300">
        <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Edificio</th>
            <th className="px-4 py-2">Nivel</th>
            <th className="px-4 py-2">Fin</th>
            <th className="px-4 py-2 text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item, index) => (
            <tr key={item.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 transition-colors">
              <td className="px-4 py-2 font-mono text-slate-500">{index + 1}</td>
              <td className="px-4 py-2 font-medium text-white">{item.building_name}</td>
              <td className="px-4 py-2">{item.target_level}</td>
              <td className="px-4 py-2 text-xs">
                 {/* Simple formatting for now. Ideally client-side countdown */}
                 {new Date(item.end_time).toLocaleTimeString()}
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  onClick={() => handleCancel(item.id)}
                  disabled={isPending}
                  className="text-red-400 hover:text-red-300 text-xs underline disabled:opacity-50"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
