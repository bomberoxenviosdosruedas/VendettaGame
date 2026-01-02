'use client';

import { GameStateProvider } from '@/components/providers/game-state-provider';
import { OverviewView } from './overview-view';
import { DashboardData } from '@/types/game';
import { MiembroFamilia, Familia } from '@/types/database';

interface OverviewWrapperProps {
  initialData: DashboardData;
  familyInfo: { miembro: MiembroFamilia; familia: Familia } | null;
}

export function OverviewWrapper({ initialData, familyInfo }: OverviewWrapperProps) {
  return (
    <GameStateProvider initialData={initialData}>
      <OverviewView familyInfo={familyInfo} />
    </GameStateProvider>
  );
}
