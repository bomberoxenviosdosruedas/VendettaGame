'use server';

import { createClient } from '@/lib/supabase/server';
import { FleetMovement } from '@/types/fleet';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SendFleetSchema = z.object({
    destino_x: z.number().min(1).max(50),
    destino_y: z.number().min(1).max(50),
    destino_z: z.number().min(1).max(255),
    mision: z.enum(['atacar', 'transportar', 'espiar']),
    tropas: z.record(z.string(), z.number()),
});

export async function getFleetData(): Promise<{ movements: FleetMovement[], availableTroops: any[] }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { movements: [], availableTroops: [] };

    // Get active movements
    const { data: movements } = await supabase
        .from('movimientos_mapa')
        .select('*')
        .eq('perfil_id', user.id)
        .gte('llegada', new Date().toISOString()) // Only active ones
        .order('llegada', { ascending: true });

    // Get troops in main base (simplified)
    const { data: property } = await supabase.from('propiedades').select('id').eq('perfil_id', user.id).limit(1).single();

    let troops: any[] = [];
    if (property) {
        const { data: t } = await supabase
            .from('tropas')
            .select('tropa_id, cantidad, configuracion_tropas(nombre)')
            .eq('propiedad_id', property.id)
            .gt('cantidad', 0);
        troops = t || [];
    }

    return {
        movements: (movements as any as FleetMovement[]) || [],
        availableTroops: troops
    };
}

export async function sendFleetAction(data: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Get Origin ID
    const { data: property } = await supabase.from('propiedades').select('id').eq('perfil_id', user.id).limit(1).single();
    if (!property) return { error: 'No tienes base' };

    const parsed = SendFleetSchema.safeParse(data);
    if (!parsed.success) return { error: 'Datos inválidos' };

    const { error } = await supabase.rpc('enviar_flota', {
        p_origen_id: property.id,
        p_destino_x: parsed.data.destino_x,
        p_destino_y: parsed.data.destino_y,
        p_destino_z: parsed.data.destino_z,
        p_mision: parsed.data.mision,
        p_tropas: parsed.data.tropas
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/fleet');
    return { success: true };
}
