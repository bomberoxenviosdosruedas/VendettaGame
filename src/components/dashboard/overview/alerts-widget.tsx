'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AtaqueEntrante } from '@/types/database';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertsWidgetProps {
  attacks: AtaqueEntrante[];
}

export function AlertsWidget({ attacks }: AlertsWidgetProps) {
  const [nearestAttackTime, setNearestAttackTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (attacks.length === 0) return;

    // Find the nearest attack
    // Assuming attacks are already sorted by date, but let's be safe
    const sortedAttacks = [...attacks].sort((a, b) => 
      new Date(a.fecha_llegada).getTime() - new Date(b.fecha_llegada).getTime()
    );
    
    const nearest = sortedAttacks[0];
    setNearestAttackTime(nearest.fecha_llegada);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const arrival = new Date(nearest.fecha_llegada).getTime();
      const diff = arrival - now;

      if (diff <= 0) {
        setCountdown("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [attacks]);

  if (attacks.length === 0) {
    return (
      <Card className="border-green-600 bg-green-50">
        <CardContent className="flex items-center gap-4 p-4">
          <ShieldCheck className="h-8 w-8 text-green-600" />
          <div>
            <h3 className="font-bold text-green-700">Estado: Seguro</h3>
            <p className="text-sm text-green-600">No hay amenazas inminentes detectadas.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-600 bg-red-50 animate-pulse-slow">
      <CardHeader className="bg-red-600 py-2 px-4">
        <CardTitle className="text-white text-sm font-bold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> ALERTA DE ATAQUE
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="font-bold text-red-700 text-lg">
                    {attacks.length} {attacks.length === 1 ? 'Ataque Entrante' : 'Ataques Entrantes'}
                </span>
                <span className="font-mono text-xl font-black text-red-600">
                    T - {countdown}
                </span>
            </div>
            <div className="text-sm text-red-800">
                Próximo impacto: {new Date(nearestAttackTime || '').toLocaleTimeString()}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
