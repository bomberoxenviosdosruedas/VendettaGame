'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { DashboardData } from '@/types/game';
import { useGameRealtime } from '@/hooks/use-game-realtime';

interface GameStateContextType {
  gameState: DashboardData | null;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

interface GameStateProviderProps {
  initialData: DashboardData | null;
  children: ReactNode;
}

export function GameStateProvider({ initialData, children }: GameStateProviderProps) {
  const gameState = useGameRealtime(initialData);

  return (
    <GameStateContext.Provider value={{ gameState }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}
