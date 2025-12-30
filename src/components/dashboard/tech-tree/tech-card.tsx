'use client'

import { useTransition } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { startResearchAction } from '@/lib/actions/research.actions'
import { useToast } from '@/hooks/use-toast'
import { ConfiguracionEntrenamiento, ColaInvestigacion } from '@/types/database'
import { Recursos } from '@/types/game'
import { Loader2, Lock, Clock, Pickaxe, Shield, Sword } from 'lucide-react'
import Image from 'next/image'

interface TechCardProps {
  config: ConfiguracionEntrenamiento
  level: number
  queueItem?: ColaInvestigacion
  resources: Recursos
  requirementsMet: boolean
  requirementsText: string[]
  propertyId: string
  queueFull: boolean
}

export function TechCard({
  config,
  level,
  queueItem,
  resources,
  requirementsMet,
  requirementsText,
  propertyId,
  queueFull
}: TechCardProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const canAfford = 
    resources.armas >= (config.costo_armas || 0) &&
    resources.municion >= (config.costo_municion || 0) &&
    resources.dolares >= (config.costo_dolares || 0)

  const isResearching = !!queueItem
  
  // Calculate progress if researching
  const calculateProgress = () => {
    if (!queueItem) return 0
    const start = new Date(queueItem.fecha_inicio).getTime()
    const end = new Date(queueItem.fecha_fin).getTime()
    const now = new Date().getTime()
    const total = end - start
    const current = now - start
    return Math.min(Math.max((current / total) * 100, 0), 100)
  }

  const handleStartResearch = () => {
    startTransition(async () => {
      const result = await startResearchAction(propertyId, config.id)
      if (result.success) {
        toast({
          title: "Investigación iniciada",
          description: `Se ha iniciado la investigación de ${config.nombre}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    })
  }

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`
  }

  return (
    <Card className={`relative overflow-hidden ${!requirementsMet ? 'opacity-75 bg-stone-100' : ''}`}>
      {!requirementsMet && (
        <div className="absolute inset-0 bg-stone-900/10 z-10 pointer-events-none flex items-center justify-center">
          <Lock className="w-12 h-12 text-stone-500 opacity-20" />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate">{config.nombre}</CardTitle>
          <Badge variant={level > 0 ? "default" : "secondary"}>
            Nvl {level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-stone-200">
           {/* Placeholder or Image */}
           <div className="absolute inset-0 flex items-center justify-center text-stone-400">
             {config.url_imagen ? (
                <Image 
                  src={`/images/${config.url_imagen}.jpg`} 
                  alt={config.nombre}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image fails
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
             ) : (
                <Pickaxe className="w-10 h-10" />
             )}
           </div>
           
           {isResearching && (
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4">
                <span className="text-white text-sm font-medium mb-2">Investigando...</span>
                <Progress value={calculateProgress()} className="h-2 w-full" />
                <span className="text-white text-xs mt-1">
                   {formatDuration((config.duracion_entrenamiento || 0))}
                </span>
             </div>
           )}
        </div>

        <div className="space-y-2 text-sm">
          {config.costo_armas && config.costo_armas > 0 ? (
            <div className={`flex justify-between ${resources.armas < config.costo_armas ? 'text-red-500' : ''}`}>
              <span className="flex items-center gap-1"><Sword className="w-3 h-3"/> Armas</span>
              <span>{config.costo_armas.toLocaleString()}</span>
            </div>
          ) : null}
          
          {config.costo_municion && config.costo_municion > 0 ? (
            <div className={`flex justify-between ${resources.municion < config.costo_municion ? 'text-red-500' : ''}`}>
               <span className="flex items-center gap-1"><Shield className="w-3 h-3"/> Munición</span>
               <span>{config.costo_municion.toLocaleString()}</span>
            </div>
          ) : null}
          
          {config.costo_dolares && config.costo_dolares > 0 ? (
            <div className={`flex justify-between ${resources.dolares < config.costo_dolares ? 'text-red-500' : ''}`}>
               <span className="flex items-center gap-1">$ Dólares</span>
               <span>{config.costo_dolares.toLocaleString()}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-stone-500">
             <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Tiempo</span>
             <span>{formatDuration(config.duracion_entrenamiento || 0)}</span>
          </div>
        </div>

        {!requirementsMet && requirementsText.length > 0 && (
           <div className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">
             <p className="font-semibold mb-1">Requisitos:</p>
             <ul className="list-disc list-inside">
               {requirementsText.map((req, i) => (
                 <li key={i}>{req}</li>
               ))}
             </ul>
           </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleStartResearch}
          disabled={!requirementsMet || !canAfford || isResearching || queueFull || isPending}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : isResearching ? (
            "En Progreso"
          ) : (
            "Investigar"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
