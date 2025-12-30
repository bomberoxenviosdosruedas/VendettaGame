import { createClient } from '@/lib/supabase/server'
import { Usuario } from '@/types/database'

export async function getUserProfile(userId: string): Promise<Usuario | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}
