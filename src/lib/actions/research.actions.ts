'use server'

import { revalidatePath } from 'next/cache'
import { startResearch } from '@/lib/services/game.service'

export async function startResearchAction(propertyId: string, researchId: string) {
  try {
    const result = await startResearch(propertyId, researchId)
    
    if (result.success) {
      revalidatePath('/dashboard/tech-tree')
      return { success: true }
    } else {
      return { success: false, error: result.error || 'Failed to start research' }
    }
  } catch (error) {
    console.error('Error starting research:', error)
    return { success: false, error: 'Internal server error' }
  }
}
