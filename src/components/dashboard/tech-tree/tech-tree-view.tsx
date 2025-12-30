'use client'

import { TechCard } from './tech-card'
import { ConfiguracionEntrenamiento, RequisitoEntrenamiento, ColaInvestigacion } from '@/types/database'
import { Recursos, InvestigacionDetalle } from '@/types/game' 
import { ScrollArea } from '@/components/ui/scroll-area'

interface TechTreeViewProps {
  configs: ConfiguracionEntrenamiento[]
  requirements: RequisitoEntrenamiento[]
  userResearch: InvestigacionDetalle[]
  queue: ColaInvestigacion | null 
  activeQueueItem?: ColaInvestigacion 
  resources: Recursos
  propertyId: string
}

export function TechTreeView({
  configs,
  requirements,
  userResearch,
  activeQueueItem,
  resources,
  propertyId
}: TechTreeViewProps) {

  // Helper to find current level
  const getLevel = (techId: string) => {
    const research = userResearch.find(r => r.id === techId)
    return research ? research.nivel : 0
  }

  // Helper to check requirements
  const checkRequirements = (techId: string) => {
    const techReqs = requirements.filter(r => r.entrenamiento_id === techId)
    if (techReqs.length === 0) return { met: true, texts: [] }

    const missing: string[] = []
    
    for (const req of techReqs) {
      if (req.entrenamiento_requerido_id) {
        const currentLvl = getLevel(req.entrenamiento_requerido_id)
        if (currentLvl < (req.nivel_requerido || 1)) {
           const reqConfig = configs.find(c => c.id === req.entrenamiento_requerido_id)
           const reqName = reqConfig ? reqConfig.nombre : req.entrenamiento_requerido_id
           missing.push(`${reqName} (Nvl ${req.nivel_requerido})`)
        }
      }
    }

    return {
      met: missing.length === 0,
      texts: missing
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {configs.map(config => {
        const level = getLevel(config.id)
        const reqStatus = checkRequirements(config.id)
        const queueItem = activeQueueItem && activeQueueItem.entrenamiento_id === config.id ? activeQueueItem : undefined
        
        return (
          <TechCard
            key={config.id}
            config={config}
            level={level}
            queueItem={queueItem}
            resources={resources}
            requirementsMet={reqStatus.met}
            requirementsText={reqStatus.texts}
            propertyId={propertyId}
            queueFull={!!activeQueueItem && activeQueueItem.entrenamiento_id !== config.id}
          />
        )
      })}
    </div>
  )
}
