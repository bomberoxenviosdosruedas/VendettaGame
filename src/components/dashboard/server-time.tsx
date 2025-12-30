'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ServerTime() {
  const [serverTime, setServerTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const date = `${String(now.getDate()).padStart(2, '0')}.${String(
        now.getMonth() + 1
      ).padStart(2, '0')}.${now.getFullYear()}`;
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setServerTime(`${date} - ${time}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-primary bg-stone-200 text-black">
      <CardHeader className="bg-primary/80 py-2 px-4 flex-row items-center justify-between">
        <CardTitle className="text-lg text-primary-foreground">
          Hora del servidor
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground">
          <span className="font-bold">[-]</span>
        </Button>
      </CardHeader>
      <CardContent className="p-4 text-center">
        <p className="text-xl font-bold">{serverTime}</p>
      </CardContent>
    </Card>
  );
}
