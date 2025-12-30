'use client';

import { useEffect, useState } from 'react';

interface ResourceTickerProps {
  initialValue: number;
  max: number;
  productionRate: number; // units per second
  lastUpdated: string; // ISO timestamp
}

export function ResourceTicker({ initialValue, max, productionRate, lastUpdated }: ResourceTickerProps) {
  const [currentValue, setCurrentValue] = useState(initialValue);

  useEffect(() => {
    // Reset on prop change
    setCurrentValue(initialValue);

    const updateValue = () => {
        const lastUpdatedTime = new Date(lastUpdated).getTime();
        const now = Date.now();
        // Handle potential clock skew or just rely on relative time if passed 'now' from server?
        // Since we don't have server time synced, we might see a jump.
        // But 'materializar_recursos' sets 'ultima_recogida_recursos' to NOW().
        // If client and server clocks differ, 'now - lastUpdatedTime' might be negative or huge.
        // BETTER APPROACH: Use the value as "current at fetch time" and just add elapsed time since mount.
        // But 'initialValue' is tied to 'lastUpdated'.
        // If I assume 'initialValue' was correct 'secondsAgo', I need 'secondsAgo'.
        // Let's assume the user just fetched it.
        // Simple Ticker: Start from initialValue and add productionRate * elapsed_since_mount.
        // This avoids clock skew issues.
        // The error is the time between server response and client mount, usually small (<1s).

        // Actually, let's stick to the Plan: "Formula: Current = Initial + (SecondsElapsed * RatePerSecond)"
    };

    const startTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsElapsed = (now - startTime) / 1000;
      const produced = secondsElapsed * productionRate;
      const newValue = Math.min(initialValue + produced, max);

      setCurrentValue(newValue);
    }, 1000);

    return () => clearInterval(interval);
  }, [initialValue, max, productionRate, lastUpdated]);

  const isFull = currentValue >= max;

  return (
    <span className={isFull ? "text-red-600 font-bold" : ""}>
      {Math.floor(currentValue).toLocaleString()}
    </span>
  );
}
