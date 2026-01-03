'use server';

import { createClient } from '@/lib/supabase/server';
import { Message, MessageFolder } from '@/types/messages';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SendMessageSchema = z.object({
    destinatario: z.string().min(3),
    asunto: z.string().min(1).max(100),
    cuerpo: z.string().min(1).max(5000),
});

export async function getMessages(): Promise<MessageFolder> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { inbox: [], sent: [], unreadCount: 0 };

    // Fetch Inbox
    const { data: inbox } = await supabase
        .from('mensajes')
        .select(`
            *,
            remitente:perfiles!remitente_id(nombre_usuario, avatar_url)
        `)
        .eq('destinatario_id', user.id)
        .eq('borrado_destinatario', false)
        .order('creado_en', { ascending: false });

    // Fetch Sent
    const { data: sent } = await supabase
        .from('mensajes')
        .select(`
            *,
            destinatario:perfiles!destinatario_id(nombre_usuario)
        `)
        .eq('remitente_id', user.id)
        .eq('borrado_remitente', false)
        .order('creado_en', { ascending: false });

    const unreadCount = inbox ? inbox.filter((m: any) => !m.leido).length : 0;

    return {
        inbox: (inbox as any as Message[]) || [],
        sent: (sent as any as Message[]) || [],
        unreadCount
    };
}

export async function sendMessageAction(formData: FormData) {
    const supabase = await createClient();

    const data = {
        destinatario: formData.get('destinatario'),
        asunto: formData.get('asunto'),
        cuerpo: formData.get('cuerpo'),
    };

    const parsed = SendMessageSchema.safeParse(data);
    if (!parsed.success) return { error: 'Datos inválidos' };

    const { error } = await supabase.rpc('enviar_mensaje', {
        p_destinatario_nombre: parsed.data.destinatario,
        p_asunto: parsed.data.asunto,
        p_cuerpo: parsed.data.cuerpo
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/messages');
    return { success: true };
}

export async function deleteMessageAction(messageId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('borrar_mensaje', { p_mensaje_id: messageId });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/messages');
    return { success: true };
}

export async function markAsReadAction(messageId: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('leer_mensaje', { p_mensaje_id: messageId });
    if (error) return { error: error.message };
    revalidatePath('/dashboard/messages');
    return { success: true };
}
