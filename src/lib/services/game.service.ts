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
  
  // First, call the RPC to materialize resources (lazy update)
  const { error: rpcError } = await supabase.rpc('materializar_recursos', {
    p_propiedad_id: propertyId
  })

  if (rpcError) {
    console.error('Error synchronizing resources:', rpcError)
    // We might still want to try to fetch the property even if the calculation failed
  }

  // Then fetch the updated property data
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

  // RPC returns json object with success/error/dates
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
