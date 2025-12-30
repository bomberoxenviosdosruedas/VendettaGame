import { createClient } from '@/lib/supabase/server'
import { Propiedad } from '@/types/database'
import { RespuestaConstruccion, ColaConstruccion } from '@/types/game'

interface CreateInitialPropertyData {
  nombre: string
  ciudad: number
  barrio: number
  edificio: number
}

interface CreateInitialPropertyResponse {
  success?: boolean
  error?: string
  propiedad_id?: string
}

interface ResearchResponse {
  success?: boolean
  error?: string
}

interface RecruitResponse {
  success?: boolean
  error?: string
}

interface MissionData {
  propiedad_origen_id: string
  tipo_mision: 'atacar' | 'transportar' | 'espiar' | 'colonizar' | 'recolectar'
  tropas: Record<string, number>
  recursos?: Record<string, number>
  destino_ciudad: number
  destino_barrio: number
  destino_edificio: number
  velocidad_flota?: number
}

interface MissionResponse {
  success?: boolean
  error?: string
  mision_id?: string
}

export async function createInitialProperty(data: CreateInitialPropertyData): Promise<CreateInitialPropertyResponse> {
  const supabase = await createClient()

  const { data: result, error } = await supabase.rpc('crear_propiedad_inicial', {
    p_nombre: data.nombre,
    p_ciudad: data.ciudad,
    p_barrio: data.barrio,
    p_edificio: data.edificio
  })

  if (error) {
    console.error('Error creating initial property:', error)
    return { error: error.message }
  }

  return result as CreateInitialPropertyResponse
}

export async function syncResources(propertyId: string): Promise<Propiedad | null> {
  const supabase = await createClient()
  
  // 1. Process queues (construction, research, etc.) for this property
  const { error: queueError } = await supabase.rpc('procesar_colas_propiedad', {
    p_propiedad_id: propertyId
  })

  if (queueError) {
    console.error('Error processing queues:', queueError)
    // Continue anyway to at least try to get resources
  }

  // 2. Materialize resources (lazy update)
  const { error: rpcError } = await supabase.rpc('materializar_recursos', {
    p_propiedad_id: propertyId
  })

  if (rpcError) {
    console.error('Error synchronizing resources:', rpcError)
  }

  // 3. Fetch the updated property data
  const { data, error } = await supabase
    .from('propiedad')
    .select('*')
    .eq('id', propertyId)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  return data
}

export async function startConstruction(propertyId: string, buildingId: string): Promise<RespuestaConstruccion> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('iniciar_construccion_habitacion', {
    p_propiedad_id: propertyId,
    p_habitacion_id: buildingId
  })

  if (error) {
    console.error('Error starting construction:', error)
    return { success: false, error: error.message }
  }

  return data as RespuestaConstruccion
}

export async function getConstructionQueue(propertyId: string): Promise<ColaConstruccion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('cola_construccion')
    .select('id, propiedad_id, habitacion_id, nivel_destino, fecha_fin')
    .eq('propiedad_id', propertyId)
    .order('fecha_fin', { ascending: true })

  if (error) {
    console.error('Error fetching construction queue:', error)
    return []
  }

  return data as ColaConstruccion[]
}

export async function startResearch(propertyId: string, researchId: string): Promise<ResearchResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('iniciar_entrenamiento', {
    p_propiedad_id: propertyId,
    p_entrenamiento_id: researchId
  })

  if (error) {
    console.error('Error starting research:', error)
    return { success: false, error: error.message }
  }

  return data as ResearchResponse
}

export async function recruitTroops(propertyId: string, troopId: string, amount: number): Promise<RecruitResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('iniciar_reclutamiento', {
    p_propiedad_id: propertyId,
    p_tropa_id: troopId,
    p_cantidad: amount
  })

  if (error) {
    console.error('Error recruiting troops:', error)
    return { success: false, error: error.message }
  }

  return data as RecruitResponse
}

export async function launchMission(missionData: MissionData): Promise<MissionResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('iniciar_mision', {
    p_propiedad_origen_id: missionData.propiedad_origen_id,
    p_tipo_mision: missionData.tipo_mision,
    p_tropas: missionData.tropas,
    p_recursos: missionData.recursos || {},
    p_destino_ciudad: missionData.destino_ciudad,
    p_destino_barrio: missionData.destino_barrio,
    p_destino_edificio: missionData.destino_edificio,
    p_velocidad_flota: missionData.velocidad_flota || 100
  })

  if (error) {
    console.error('Error launching mission:', error)
    return { success: false, error: error.message }
  }

  return data as MissionResponse
}
