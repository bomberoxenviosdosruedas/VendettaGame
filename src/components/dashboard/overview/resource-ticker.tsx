'use client';

import { useEffect, useState, useRef } from 'react';

interface ResourceTickerProps {
  initialValue: number;
  productionRate: number; // per hour
  lastUpdated?: string; // timestamp string (ISO)
}

export function ResourceTicker({ initialValue, productionRate, lastUpdated }: ResourceTickerProps) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Parse lastUpdated if provided, otherwise assume initialValue is fresh from server rendering
  const baseTimeRef = useRef(lastUpdated ? new Date(lastUpdated).getTime() : Date.now());

  useEffect(() => {
    const ratePerSecond = productionRate / 3600;
    
    // Function to calculate the current value
    const updateValue = () => {
      const now = Date.now();
      
      // Calculate elapsed time since the base time (when the value was accurate)
      // If lastUpdated was provided, we use that.
      // If we only have initialValue and assume it's "now", we rely on client clock which is fine for visual interpolation.
      // However, usually we get 'val' which is the value at 'lastUpdated' or 'now' (if fresh).
      // Since dashboard RPC usually updates resources before returning, let's assume initialValue is fresh at component mount.
      
      const secondsElapsed = (now - baseTimeRef.current) / 1000;
      const addedValue = secondsElapsed * ratePerSecond;
      
      setCurrentValue(initialValue + addedValue);
      
      animationFrameRef.current = requestAnimationFrame(updateValue);
    };

    // Start the loop
    animationFrameRef.current = requestAnimationFrame(updateValue);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initialValue, productionRate, lastUpdated]);

  return <>{Math.floor(currentValue).toLocaleString()}</>;
}
