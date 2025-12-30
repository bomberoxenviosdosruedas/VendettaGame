'use client';
import { ServerTime } from '@/components/dashboard/server-time';
import { Troops } from '@/components/dashboard/troops';
import { ExpandingRooms } from '@/components/dashboard/expanding-rooms';
import { BuildingInfo } from '@/components/dashboard/building-info';
import { Training } from '@/components/dashboard/training';
import { TroopsDefense } from '@/components/dashboard/troops-defense';
import { TroopsInTraining } from '@/components/dashboard/troops-in-training';
import { Needles } from '@/components/dashboard/needles';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-4">
        <ServerTime />
        <Troops />
        <ExpandingRooms />
        <Training />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <BuildingInfo />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <TroopsDefense />
          <TroopsInTraining />
        </div>
        <Needles />
      </div>
    </div>
  );
}
