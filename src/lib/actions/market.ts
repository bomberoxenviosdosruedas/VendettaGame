'use server';

import { createClient } from '@/lib/supabase/server';
import { MarketOffer } from '@/types/market';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateOfferSchema = z.object({
    recurso: z.enum(['armas', 'municion', 'alcohol', 'dolares']),
    cantidad: z.number().positive(),
    pide_armas: z.number().min(0),
    pide_municion: z.number().min(0),
    pide_dolares: z.number().min(0),
});

export async function getMarketOffers(filterResource?: string): Promise<MarketOffer[]> {
    const supabase = await createClient();

    let query = supabase
        .from('ofertas_mercado')
        .select(`
            *,
            vendedor:perfiles(nombre_usuario)
        `)
        .eq('aceptada', false)
        .gt('expira_en', new Date().toISOString())
        .order('creado_en', { ascending: false });

    if (filterResource && filterResource !== 'all') {
        query = query.eq('recurso', filterResource);
    }

    const { data, error } = await query;
    if (error) return [];
    return data as any as MarketOffer[];
}

export async function getMyOffers(): Promise<MarketOffer[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('ofertas_mercado')
        .select('*')
        .eq('vendedor_id', user.id)
        .eq('aceptada', false); // Show only active ones? or history? Assuming active management.

    if (error) return [];
    return data as any as MarketOffer[];
}

export async function createOfferAction(data: {
    recurso: string;
    cantidad: number;
    pide_armas: number;
    pide_municion: number;
    pide_dolares: number;
}) {
    const supabase = await createClient();

    const parsed = CreateOfferSchema.safeParse(data);
    if (!parsed.success) return { error: 'Datos inválidos' };

    const { error } = await supabase.rpc('publicar_oferta', {
        p_recurso: parsed.data.recurso,
        p_cantidad: parsed.data.cantidad,
        p_pide_armas: parsed.data.pide_armas,
        p_pide_municion: parsed.data.pide_municion,
        p_pide_dolares: parsed.data.pide_dolares
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/market');
    return { success: true };
}

export async function buyOfferAction(offerId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('comprar_oferta', {
        p_oferta_id: offerId
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/market');
    return { success: true };
}

export async function cancelOfferAction(offerId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('cancelar_oferta', {
        p_oferta_id: offerId
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/market');
    return { success: true };
}
