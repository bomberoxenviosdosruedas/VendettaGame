'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ResourceTickerProps {
  initialValue: number;
  productionRate: number; // per hour
  lastUpdated?: string; // timestamp string (ISO)
  className?: string;
}

export function ResourceTicker({ initialValue, productionRate, lastUpdated, className }: ResourceTickerProps) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const animationFrameRef = useRef<number | null>(null);

  // Parse lastUpdated if provided, otherwise assume initialValue is fresh from server rendering
  const baseTimeRef = useRef(lastUpdated ? new Date(lastUpdated).getTime() : Date.now());
  const initialValueRef = useRef(initialValue);

  // If initialValue updates (re-render from server or parent), we should sync up but maintain smoothness.
  // Actually, if parent passes new initialValue, it implies a fresh fetch.
  useEffect(() => {
    initialValueRef.current = initialValue;
    baseTimeRef.current = lastUpdated ? new Date(lastUpdated).getTime() : Date.now();
    setCurrentValue(initialValue);
  }, [initialValue, lastUpdated]);

  useEffect(() => {
    const ratePerSecond = productionRate / 3600;
    
    // Function to calculate the current value
    const updateValue = () => {
      const now = Date.now();
      
      const secondsElapsed = (now - baseTimeRef.current) / 1000;
      const addedValue = secondsElapsed * ratePerSecond;
      
      setCurrentValue(initialValueRef.current + addedValue);
      
      animationFrameRef.current = requestAnimationFrame(updateValue);
    };

    // Start the loop
    animationFrameRef.current = requestAnimationFrame(updateValue);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [productionRate]);

  return <span className={cn(className)}>{Math.floor(currentValue).toLocaleString()}</span>;
}
