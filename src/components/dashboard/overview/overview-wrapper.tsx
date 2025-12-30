'use client';

import { GameStateProvider } from '@/components/providers/game-state-provider';
import { OverviewDashboard } from './overview-dashboard';
import { DashboardData } from '@/types/game';
import { MiembroFamilia, Familia } from '@/types/database';

interface OverviewWrapperProps {
  initialData: DashboardData;
  familyInfo: { miembro: MiembroFamilia; familia: Familia } | null;
}

export function OverviewWrapper({ initialData, familyInfo }: OverviewWrapperProps) {
  return (
    <GameStateProvider initialData={initialData}>
      <OverviewDashboard familyInfo={familyInfo} />
    </GameStateProvider>
  );
}
