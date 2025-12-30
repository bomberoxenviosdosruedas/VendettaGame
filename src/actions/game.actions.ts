'use server'

import { z } from 'zod'
import { createInitialProperty, startConstruction, syncResources } from '@/lib/services/game.service'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const onboardingSchema = z.object({
  nombre: z.string().min(3),
  ciudad: z.coerce.number().min(1).max(100),
  barrio: z.coerce.number().min(1).max(25),
  edificio: z.coerce.number().min(1).max(25),
})

export async function completeOnboardingAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  const parsed = onboardingSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos. Verifica las coordenadas y el nombre.' }
  }

  const result = await createInitialProperty({
    nombre: parsed.data.nombre,
    ciudad: parsed.data.ciudad,
    barrio: parsed.data.barrio,
    edificio: parsed.data.edificio,
  })

  if (result.error) {
    return { success: false, error: result.error }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function upgradeBuildingAction(buildingId: string) {
  // Use z.string() because the DB uses text IDs (slugs), not UUIDs, for configuration tables like 'configuracion_habitacion'
  // Example ID: 'oficina_del_jefe'
  const schema = z.string().min(1)
  const parsed = schema.safeParse(buildingId)

  if (!parsed.success) {
    return { success: false, error: 'ID de edificio inválido' }
  }

  // Verify authentication and get property ID
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: propiedad, error: propError } = await supabase
    .from('propiedad')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  if (propError || !propiedad) {
    return { success: false, error: 'Propiedad no encontrada' }
  }

  const result = await startConstruction(propiedad.id, parsed.data)

  if (result.success) {
    revalidatePath('/game/buildings')
    return { success: true, message: 'Construcción iniciada' }
  } else {
    // If specific error from RPC (e.g. resources insufficient, queue full)
    return { success: false, error: result.error || 'No se pudo iniciar la construcción' }
  }
}

export async function refreshGameStateAction() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: propiedad, error: propError } = await supabase
    .from('propiedad')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  if (propError || !propiedad) {
    return { success: false, error: 'Propiedad no encontrada' }
  }

  const resources = await syncResources(propiedad.id)
  
  if (!resources) {
    return { success: false, error: 'Error al sincronizar recursos' }
  }

  return { success: true, data: resources }
}
