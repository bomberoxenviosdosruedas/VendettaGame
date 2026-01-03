'use server';

import { createClient } from '@/lib/supabase/server';
import { BattleReport } from '@/types/reports';

export async function getReports(): Promise<BattleReport[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('batallas')
        .select(`
            *,
            atacante:perfiles!atacante_id(nombre_usuario),
            defensor:perfiles!defensor_id(nombre_usuario)
        `)
        .or(`atacante_id.eq.${user.id},defensor_id.eq.${user.id}`)
        .order('fecha', { ascending: false });

    return (data as any as BattleReport[]) || [];
}

export async function getReportDetail(id: string): Promise<BattleReport | null> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('batallas')
        .select(`
            *,
            atacante:perfiles!atacante_id(nombre_usuario),
            defensor:perfiles!defensor_id(nombre_usuario)
        `)
        .eq('id', id)
        .single();

    return (data as any as BattleReport) || null;
}
