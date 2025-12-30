'use server'

import { z } from 'zod'
import {
  createInitialProperty,
  startConstruction,
  syncResources,
  startResearch,
  recruitTroops,
  launchMission,
  cancelConstruction,
  getDashboardData
} from '@/lib/services/game.service'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const onboardingSchema = z.object({
  nombre: z.string().min(3),
  ciudad: z.coerce.number().min(1).max(100),
  barrio: z.coerce.number().min(1).max(25),
  edificio: z.coerce.number().min(1).max(25),
})

const missionSchema = z.object({
  propiedad_origen_id: z.string().uuid(),
  tipo_mision: z.enum(['atacar', 'transportar', 'espiar', 'colonizar', 'recolectar']),
  tropas: z.record(z.string(), z.number().int().min(1)),
  recursos: z.record(z.string(), z.number().int().min(0)).optional(),
  destino_ciudad: z.coerce.number().min(1),
  destino_barrio: z.coerce.number().min(1),
  destino_edificio: z.coerce.number().min(1),
  velocidad_flota: z.coerce.number().min(1).max(100).optional(),
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
  const schema = z.string().min(1)
  const parsed = schema.safeParse(buildingId)

  if (!parsed.success) {
    return { success: false, error: 'ID de edificio inválido' }
  }

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
    revalidatePath('/dashboard/buildings')
    revalidatePath('/dashboard/overview')
    return { success: true, message: 'Construcción iniciada' }
  } else {
    return { success: false, error: result.error || 'No se pudo iniciar la construcción' }
  }
}

export async function cancelConstructionAction(queueId: string) {
  const schema = z.string().uuid()
  const parsed = schema.safeParse(queueId)

  if (!parsed.success) {
    return { success: false, error: 'ID de cola inválido' }
  }

  // Assuming auth check in RPC
  const result = await cancelConstruction(parsed.data)

  if (result.success) {
    revalidatePath('/dashboard/buildings')
    revalidatePath('/dashboard/overview')
    return { success: true, message: 'Construcción cancelada' }
  } else {
    return { success: false, error: result.error || 'No se pudo cancelar la construcción' }
  }
}

export async function getDashboardDataAction() {
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

  const dashboardData = await getDashboardData(propiedad.id)
  
  if (!dashboardData) {
    return { success: false, error: 'Error al obtener datos' }
  }

  return { success: true, data: dashboardData }
}

export async function refreshGameStateAction() {
  const result = await getDashboardDataAction()
  if (!result.success || !result.data) {
    return { success: false, error: result.error }
  }
  return { success: true, data: result.data.propiedad } // Return prop only for legacy support if needed
}

export async function startResearchAction(researchId: string) {
  const schema = z.string().min(1)
  const parsed = schema.safeParse(researchId)

  if (!parsed.success) {
    return { success: false, error: 'ID de investigación inválido' }
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'No autenticado' }
  }

  // Research is tied to property for queue, so we need a property context.
  // Assuming active property or main property. For now, fetch main property.
  const { data: propiedad, error: propError } = await supabase
    .from('propiedad')
    .select('id')
    .eq('usuario_id', user.id)
    .single()

  if (propError || !propiedad) {
    return { success: false, error: 'Propiedad no encontrada' }
  }

  const result = await startResearch(propiedad.id, parsed.data)

  if (result.success) {
    revalidatePath('/game/research')
    return { success: true, message: 'Investigación iniciada' }
  } else {
    return { success: false, error: result.error || 'No se pudo iniciar la investigación' }
  }
}

export async function recruitTroopsAction(troopId: string, amount: number) {
  if (amount <= 0) return { success: false, error: 'Cantidad inválida' }

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

  const result = await recruitTroops(propiedad.id, troopId, amount)

  if (result.success) {
    revalidatePath('/game/recruitment')
    return { success: true, message: 'Reclutamiento iniciado' }
  } else {
    return { success: false, error: result.error || 'No se pudo iniciar el reclutamiento' }
  }
}

export async function launchMissionAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  // Parse nested JSON strings if coming from form hidden inputs, or handle appropriately.
  // Assuming the form sends 'tropas' as a JSON string for now, or constructing it manually.
  // For simplicity, let's assume valid form data structure or client-side preparation.
  // If complex, it might need more parsing logic.

  // However, Server Actions usually receive FormData. If the client sends complex structures,
  // they often serialize to JSON strings.

  const rawTropas = data.tropas ? JSON.parse(data.tropas as string) : {}
  const rawRecursos = data.recursos ? JSON.parse(data.recursos as string) : {}

  const payload = {
    propiedad_origen_id: data.propiedad_origen_id,
    tipo_mision: data.tipo_mision,
    tropas: rawTropas,
    recursos: rawRecursos,
    destino_ciudad: data.destino_ciudad,
    destino_barrio: data.destino_barrio,
    destino_edificio: data.destino_edificio,
    velocidad_flota: data.velocidad_flota
  }

  const parsed = missionSchema.safeParse(payload)

  if (!parsed.success) {
    return { success: false, error: 'Datos de misión inválidos', details: parsed.error.flatten() }
  }

  const result = await launchMission(parsed.data)

  if (result.success) {
    revalidatePath('/game/fleet')
    return { success: true, message: 'Misión lanzada exitosamente' }
  } else {
    return { success: false, error: result.error || 'No se pudo lanzar la misión' }
  }
}
