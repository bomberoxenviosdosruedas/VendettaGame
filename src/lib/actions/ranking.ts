'use server';

import { createClient } from '@/lib/supabase/server';
import { RankingProfile } from '@/types/ranking';

export async function getRanking(page: number = 1, limit: number = 50): Promise<{ data: RankingProfile[], total: number }> {
    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // We need to join with alliance members to get alliance tag
    // Since Supabase join syntax can be tricky with complex relations, let's try standard select.
    // 'miembros_alianza' links profile -> alliance.

    const { data, count, error } = await supabase
        .from('perfiles')
        .select(`
            id, nombre_usuario, puntos_total, posicion_ranking, avatar_url,
            miembros_alianza (
                alianza ( etiqueta, nombre )
            )
        `, { count: 'exact' })
        .order('puntos_total', { ascending: false })
        .range(from, to);

    if (error) return { data: [], total: 0 };

    // Transform data to flatten alliance structure
    const formatted: RankingProfile[] = data.map((p: any) => ({
        id: p.id,
        nombre_usuario: p.nombre_usuario,
        puntos_total: p.puntos_total,
        posicion_ranking: p.posicion_ranking, // Ideally this is pre-calculated by a cron job
        avatar_url: p.avatar_url,
        alianza: p.miembros_alianza?.[0]?.alianza
    }));

    return { data: formatted, total: count || 0 };
}
