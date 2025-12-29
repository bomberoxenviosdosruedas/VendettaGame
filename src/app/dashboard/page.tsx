'use client';
import { ServerTime } from './server-time';
import { Troops } from './troops';
import { ExpandingRooms } from './expanding-rooms';
import { BuildingInfo } from './building-info';
import { Training } from './training';
import { TroopsDefense } from './troops-defense';
import { TroopsInTraining } from './troops-in-training';
import { Needles } from './needles';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-4">
        <ServerTime />
        <Troops />
        <ExpandingRooms />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <BuildingInfo />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Training />
          <TroopsDefense />
          <TroopsInTraining />
        </div>
        <Needles />
      </div>
    </div>
  );
}
