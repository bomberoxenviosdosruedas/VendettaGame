'use server';

import { createClient } from '@/lib/supabase/server';
import { AllianceData, Alliance, AllianceMember, AllianceRequest, AllianceWar } from '@/types/alliance';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateAllianceSchema = z.object({
    nombre: z.string().min(3).max(50),
    etiqueta: z.string().min(2).max(8),
    descripcion: z.string().optional(),
});

export async function getAllianceData(): Promise<AllianceData | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Get user's alliance membership
    const { data: membership, error: memberError } = await supabase
        .from('miembros_alianza')
        .select('alianza_id, rango')
        .eq('perfil_id', user.id)
        .single();

    if (memberError || !membership) return null;

    const allianceId = membership.alianza_id;
    const userRank = membership.rango as 'Lider' | 'Colider' | 'Miembro';

    // 2. Get Alliance Details
    const { data: alliance } = await supabase
        .from('alianzas')
        .select('*')
        .eq('id', allianceId)
        .single();

    // 3. Get Members
    const { data: members } = await supabase
        .from('miembros_alianza')
        .select(`
            *,
            perfil:perfiles(nombre_usuario, ultimo_activo, puntos_total)
        `)
        .eq('alianza_id', allianceId)
        .order('rango', { ascending: true });

    // 4. Get Requests (only if Leader/Colider)
    let requests: AllianceRequest[] = [];
    if (['Lider', 'Colider'].includes(userRank)) {
        const { data: reqs } = await supabase
            .from('solicitudes_alianza')
            .select(`
                *,
                perfil:perfiles(nombre_usuario, puntos_total)
            `)
            .eq('alianza_id', allianceId);
        if (reqs) requests = reqs as any;
    }

    // 5. Get Wars (Active)
    const { data: wars } = await supabase
        .from('guerras')
        .select('*')
        .or(`alianza1_id.eq.${allianceId},alianza2_id.eq.${allianceId}`)
        .is('fecha_fin', null);

    return {
        alliance: alliance as Alliance,
        members: members as any as AllianceMember[],
        requests,
        wars: (wars || []) as AllianceWar[],
        userRank
    };
}

export async function searchAlliances(query: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('alianzas')
        .select('id, nombre, etiqueta, descripcion, miembros:miembros_alianza(count)')
        .or(`nombre.ilike.%${query}%,etiqueta.ilike.%${query}%`)
        .limit(20);

    if (error) throw new Error(error.message);
    return data;
}

export async function createAllianceAction(formData: FormData) {
    const supabase = await createClient();
    const data = {
        nombre: formData.get('nombre'),
        etiqueta: formData.get('etiqueta'),
        descripcion: formData.get('descripcion'),
    };

    const parsed = CreateAllianceSchema.safeParse(data);
    if (!parsed.success) {
        return { error: 'Datos inválidos' };
    }

    const { error } = await supabase.rpc('crear_alianza', {
        p_nombre: parsed.data.nombre,
        p_etiqueta: parsed.data.etiqueta,
        p_descripcion: parsed.data.descripcion || ''
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/alliance');
    return { success: true };
}

export async function joinAllianceAction(allianceId: string, message: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('solicitar_ingreso_alianza', {
        p_alianza_id: allianceId,
        p_mensaje: message
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/alliance');
    return { success: true };
}

export async function acceptRequestAction(requestId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('aceptar_solicitud_alianza', {
        p_solicitud_id: requestId
    });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/alliance');
    return { success: true };
}

export async function rejectRequestAction(requestId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('rechazar_solicitud_alianza', {
        p_solicitud_id: requestId
    });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/alliance');
    return { success: true };
}

export async function leaveAllianceAction() {
    const supabase = await createClient();
    const { error } = await supabase.rpc('salir_alianza');
    if (error) return { error: error.message };
    revalidatePath('/dashboard/alliance');
    return { success: true };
}

export async function kickMemberAction(memberId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('expulsar_miembro', {
        p_miembro_id: memberId
    });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/alliance');
    return { success: true };
}
