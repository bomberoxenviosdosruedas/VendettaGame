'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SettingsSchema = z.object({
    avatar_url: z.string().url().optional().or(z.literal('')),
    vacaciones: z.boolean().optional(),
});

export async function getSettings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('perfiles')
        .select('nombre_usuario, avatar_url, vacaciones, email')
        .eq('id', user.id)
        .single();

    return data;
}

export async function updateSettingsAction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const data = {
        avatar_url: formData.get('avatar_url') as string,
        vacaciones: formData.get('vacaciones') === 'on',
    };

    const parsed = SettingsSchema.safeParse(data);
    if (!parsed.success) return { error: 'Datos inválidos' };

    const { error } = await supabase
        .from('perfiles')
        .update({
            avatar_url: parsed.data.avatar_url,
            vacaciones: parsed.data.vacaciones
        })
        .eq('id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/settings');
    return { success: true };
}
