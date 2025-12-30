import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardData } from '@/types/game';
import { getDashboardDataAction } from '@/actions/game.actions';

export function useGameRealtime(initialData: DashboardData | null) {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const supabase = createClient();

  // Ref for client-side interpolation state
  const lastUpdateRef = useRef<number>(Date.now());
  const interpolationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!initialData?.propiedad.id) return;

    const propertyId = initialData.propiedad.id;
    const userId = initialData.propiedad.usuario_id;

    // Helper to refresh full data on complex events
    const refreshData = async () => {
      const result = await getDashboardDataAction();
      if (result.success && result.data) {
        setData(result.data);
        lastUpdateRef.current = Date.now();
      }
    };

    // Subscription
    const channel = supabase.channel('game-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'propiedad',
          filter: `id=eq.${propertyId}`,
        },
        (payload) => {
          // Optimistic/Partial update for property resources
          setData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              propiedad: { ...prev.propiedad, ...payload.new as any },
              recursos: {
                ...prev.recursos,
                armas: { ...prev.recursos.armas, val: payload.new.armas },
                municion: { ...prev.recursos.municion, val: payload.new.municion },
                alcohol: { ...prev.recursos.alcohol, val: payload.new.alcohol },
                dolares: { ...prev.recursos.dolares, val: payload.new.dolares },
              }
            };
          });
          lastUpdateRef.current = Date.now();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cola_construccion', filter: `propiedad_id=eq.${propertyId}` },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habitacion_usuario', filter: `propiedad_id=eq.${propertyId}` },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cola_reclutamiento', filter: `propiedad_id=eq.${propertyId}` },
        () => refreshData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tropa_propiedad', filter: `propiedad_id=eq.${propertyId}` },
        () => refreshData()
      );

    if (userId) {
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ataque_entrante', filter: `defensor_id=eq.${userId}` },
          () => refreshData()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'cola_misiones', filter: `usuario_id=eq.${userId}` },
          () => refreshData()
        );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialData?.propiedad.id, initialData?.propiedad.usuario_id, supabase]);

  // Interpolation effect
  useEffect(() => {
    if (!data) return;

    interpolationIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastUpdateRef.current) / 1000;

      // Don't interpolate if elapsed time is negligible or too large (tab inactive)
      if (elapsedSeconds < 0.1 || elapsedSeconds > 5) return;

      setData((prev) => {
        if (!prev) return null;

        const interpolate = (current: number, max: number, prodPerHour: number) => {
          const prodPerSec = prodPerHour / 3600;
          const added = prodPerSec * elapsedSeconds;
          return Math.min(max, current + added);
        };

        return {
          ...prev,
          recursos: {
            ...prev.recursos,
            armas: { ...prev.recursos.armas, val: interpolate(prev.recursos.armas.val, prev.recursos.armas.max, prev.recursos.armas.prod) },
            municion: { ...prev.recursos.municion, val: interpolate(prev.recursos.municion.val, prev.recursos.municion.max, prev.recursos.municion.prod) },
            alcohol: { ...prev.recursos.alcohol, val: interpolate(prev.recursos.alcohol.val, prev.recursos.alcohol.max, prev.recursos.alcohol.prod) },
            dolares: { ...prev.recursos.dolares, val: interpolate(prev.recursos.dolares.val, prev.recursos.dolares.max, prev.recursos.dolares.prod) },
          }
        };
      });

      lastUpdateRef.current = now;
    }, 1000); // Update every second

    return () => {
      if (interpolationIntervalRef.current) {
        clearInterval(interpolationIntervalRef.current);
      }
    };
  }, [data?.recursos.armas.prod]); // Re-run if production rates change (e.g. after refreshData)

  return data;
}
