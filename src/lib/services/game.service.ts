import { createClient } from '@/lib/supabase/server'
import { Propiedad, AtaqueEntrante, ColaMisiones, MiembroFamilia, Familia } from '@/types/database'
import { RespuestaConstruccion, ColaConstruccion, DashboardData } from '@/types/game'

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

export interface MapTileData {
  propiedad_id: string
  coordenada_edificio: number
  usuario_id: string
  nombre_usuario: string
  nombre_familia: string | null
  etiqueta_familia: string | null
  puntos: number
  es_propia: boolean
}

export async function getMapTiles(city: number, district: number): Promise<MapTileData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_map_tiles', {
    p_ciudad: city,
    p_barrio: district
  })

  if (error) {
    console.error('Error fetching map tiles:', error)
    return []
  }

  return data as MapTileData[]
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

export async function getUserProperty(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('propiedad').select('id').eq('usuario_id', userId).maybeSingle()

  if (error) {
    console.error('Error checking user property:', error)
    return null
  }
  return data?.id || null
}

export async function getDashboardData(propertyId: string): Promise<DashboardData | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_dashboard_data', {
    p_propiedad_id: propertyId
  })

  if (error) {
    console.error('Error fetching dashboard data:', error)
    return null
  }

  return data as DashboardData
}

export async function getIncomingAttacks(propertyId: string): Promise<AtaqueEntrante[]> {
  const supabase = await createClient()

  // First get the user_id for this property to filter attacks targeting this user
  const { data: prop, error: propError } = await supabase
    .from('propiedad')
    .select('usuario_id')
    .eq('id', propertyId)
    .single()

  if (propError || !prop) {
      console.error('Error getting property owner for attacks:', propError)
      return []
  }

  const { data, error } = await supabase
    .from('ataque_entrante')
    .select('*')
    .eq('defensor_id', prop.usuario_id)
    .order('fecha_llegada', { ascending: true })

  if (error) {
    console.error('Error fetching incoming attacks:', error)
    return []
  }

  return data as AtaqueEntrante[]
}

export async function getActiveMissions(propertyId: string): Promise<ColaMisiones[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
      .from('cola_misiones')
      .select('*')
      .eq('propiedad_origen_id', propertyId)
      .order('fecha_llegada', { ascending: true })

  if (error) {
      console.error('Error fetching active missions:', error)
      return []
  }

  return data as ColaMisiones[]
}

export async function getFamilyInfo(userId: string): Promise<{ miembro: MiembroFamilia, familia: Familia } | null> {
  const supabase = await createClient()
  const { data: miembro, error: mError } = await supabase
      .from('miembro_familia')
      .select('*')
      .eq('usuario_id', userId)
      .maybeSingle()
  
  if (mError || !miembro) return null

  const { data: familia, error: fError } = await supabase
      .from('familia')
      .select('*')
      .eq('id', miembro.familia_id)
      .single()
  
  if (fError || !familia) return null

  return { miembro, familia }
}

export async function cancelConstruction(queueId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('cancelar_construccion', {
    p_cola_id: queueId
  })

  if (error) {
    console.error('Error cancelling construction:', error)
    return { success: false, error: error.message }
  }

  const result = data as { success: boolean; error?: string }
  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true }
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
