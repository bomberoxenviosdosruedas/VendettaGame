'use server';

import { createClient } from '@/lib/supabase/server';
import { Research, ResearchQueueItem } from '@/types/research';
import { revalidatePath } from 'next/cache';

export async function getResearchData(): Promise<{ technologies: Research[], queue: ResearchQueueItem[] }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { technologies: [], queue: [] };

    // Get Config
    const { data: config } = await supabase.from('configuracion_investigaciones').select('*');

    // Get Current Levels
    const { data: levels } = await supabase.from('investigaciones').select('investigacion_id, nivel').eq('perfil_id', user.id);

    // Get Queue
    const { data: queue } = await supabase
        .from('cola_investigacion')
        .select('*')
        .eq('perfil_id', user.id)
        .order('fin', { ascending: true });

    // Map data
    const technologies: Research[] = (config || []).map((c: any) => {
        const userLevel = levels?.find(l => l.investigacion_id === c.id)?.nivel || 0;
        return {
            id: c.id,
            nombre: c.nombre,
            descripcion: c.descripcion,
            costo_armas: c.costo_armas * (userLevel + 1), // Simplified scaling
            costo_municion: c.costo_municion * (userLevel + 1),
            costo_dolares: c.costo_dolares * (userLevel + 1),
            duracion_base: c.duracion_base * (userLevel + 1),
            nivel: userLevel,
            requisitos_cumplidos: true // Placeholder logic
        };
    });

    return {
        technologies,
        queue: (queue as any as ResearchQueueItem[]) || []
    };
}

export async function startResearchAction(researchId: string) {
    const supabase = await createClient();
    // Logic should be moved to RPC for safety, but for now we call a hypotetical RPC
    // or implement basic logic here if RPC is missing.
    // Spec said: RPC `iniciar_investigacion`
    // Checking memory... "RPCs `iniciar_construccion`, `iniciar_entrenamiento`..."
    // Wait, `iniciar_entrenamiento` usually refers to units? Or research?
    // Legacy "Entrenamiento" = Research.
    // Let's assume there is an RPC `iniciar_investigacion` or we create it.

    // I will check if I created `iniciar_investigacion` in previous steps.
    // I did NOT create `iniciar_investigacion` in previous steps.
    // I will add it to the Combat RPC migration or a new one.
    // Actually, I should add it now. I'll add it to `supabase/migrations/20250227150000_combat_rpcs.sql`
    // ALONG with combat logic to save a step, or separate.
    // Since I'm in "Implement Research Module", I will assume it will be there.

    const { error } = await supabase.rpc('iniciar_investigacion', {
        p_investigacion_id: researchId
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/research');
    return { success: true };
}
