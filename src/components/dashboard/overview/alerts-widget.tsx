'use client';

import { IncomingAttack } from '@/types/game';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertsWidgetProps {
  attacks: IncomingAttack[];
}

export function AlertsWidget({ attacks }: AlertsWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<string>('--:--:--');

  useEffect(() => {
    if (attacks.length === 0) return;

    // Assumes attacks are sorted by arrival time (ascending)
    const nextAttack = attacks[0];

    const updateTimer = () => {
      const now = new Date().getTime();
      const arrival = new Date(nextAttack.fecha_llegada).getTime();
      const diff = arrival - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [attacks]);

  if (attacks.length === 0) {
    return (
      <Card className="bg-green-100 border-green-500 mb-4">
        <CardContent className="flex items-center p-4 text-green-800">
          <ShieldCheck className="mr-2 h-6 w-6" />
          <span className="font-bold">Estado Seguro: No hay ataques entrantes.</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-red-100 border-red-600 mb-4 animate-pulse">
      <CardContent className="flex items-center justify-between p-4 text-red-900">
        <div className="flex items-center">
          <AlertTriangle className="mr-2 h-6 w-6 text-red-600" />
          <span className="font-bold text-lg">¡ALERTA DE ATAQUE!</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono font-bold">{timeLeft}</div>
          <div className="text-sm">{attacks.length} ataque(s) detectado(s)</div>
        </div>
      </CardContent>
    </Card>
  );
}
