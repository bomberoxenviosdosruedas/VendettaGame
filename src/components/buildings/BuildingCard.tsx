'use client';

import { useOptimistic, useTransition } from 'react';
import { enqueueBuildingUpgrade } from '@/lib/actions/buildings';
import { BaseBuildingRPC } from '@/types/legacy_schema';

interface BuildingCardProps {
  building: BaseBuildingRPC;
  baseId: string;
  isQueueFull: boolean;
}

export default function BuildingCard({ building, baseId, isQueueFull }: BuildingCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    startTransition(async () => {
      const result = await enqueueBuildingUpgrade(baseId, building.building_id); // Use building_id (config id)
      if (result.error) {
        alert(result.error);
      }
    });
  };

  const canAfford = true;
  const isDisabled = isQueueFull || isPending || !canAfford;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col md:flex-row gap-4">
      {/* Image Fallback */}
      <div className="w-full md:w-32 h-32 bg-slate-700 rounded-md flex-shrink-0 relative overflow-hidden">
        {building.name && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
             {building.name[0]}
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold text-white">
          {building.name} <span className="text-sm font-normal text-slate-400">(Nivel {building.level})</span>
        </h3>
        <p className="text-sm text-slate-400 mt-1 mb-2 line-clamp-2">
          {building.description}
        </p>

        <div className="flex gap-4 text-xs text-slate-300">
          <span title="Armamentos">🔫 {building.cost_armaments}</span>
          <span title="Munición">📦 {building.cost_munitions}</span>
          <span title="Dólares">💵 {building.cost_dollars}</span>
          <span title="Duración">⏱ {building.base_duration}s</span>
        </div>
      </div>

      <div className="flex flex-col justify-center items-end min-w-[120px]">
        {isDisabled ? (
           <button
             disabled
             className="px-4 py-2 bg-slate-600 text-slate-300 rounded cursor-not-allowed w-full text-center"
           >
             {isPending ? 'Encolando...' : isQueueFull ? 'Cola Llena' : 'Recursos Insuf.'}
           </button>
        ) : (
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors w-full"
          >
            Mejorar
          </button>
        )}
      </div>
    </div>
  );
}
