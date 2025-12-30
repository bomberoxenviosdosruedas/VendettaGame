'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUserProperty } from "@/lib/services/game.service";

export async function recruitTroopsAction(troopId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado' };
  }

  if (quantity <= 0) {
    return { success: false, error: 'La cantidad debe ser mayor a 0' };
  }

  const propertyId = await getUserProperty(user.id);
  if (!propertyId) {
    return { success: false, error: 'Propiedad no encontrada' };
  }

  const { error } = await supabase.rpc('iniciar_reclutamiento', {
    p_propiedad_id: propertyId,
    p_tropa_id: troopId,
    p_cantidad: quantity,
  });

  if (error) {
    console.error('Error reclutando tropas:', error);
    // Supabase RPC errors are often formatted as "Error: message"
    // We try to extract the message if it's a known format or return the raw message
    return { success: false, error: error.message || 'Error al iniciar reclutamiento' };
  }

  revalidatePath('/dashboard/recruitment');
  return { success: true };
}
