import { BaseBuildingRPC } from '@/types/legacy_schema';
import BuildingCard from './BuildingCard';

interface BuildingListProps {
  buildings: BaseBuildingRPC[];
  baseId: string;
  isQueueFull: boolean;
}

export default function BuildingList({ buildings, baseId, isQueueFull }: BuildingListProps) {
  return (
    <div className="space-y-4">
      {buildings.map((b) => (
        <BuildingCard
          key={b.building_id}
          building={b}
          baseId={baseId}
          isQueueFull={isQueueFull}
        />
      ))}
    </div>
  );
}
