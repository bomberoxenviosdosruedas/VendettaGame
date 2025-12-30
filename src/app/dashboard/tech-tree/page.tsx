
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/services/game.service'
import { TechTreeView } from '@/components/dashboard/tech-tree/tech-tree-view'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Construction } from 'lucide-react'
import { Recursos } from '@/types/game'
import { ColaInvestigacion } from '@/types/database'

export default async function TechTreePage() {
  const supabase = await createClient()

  // 1. Get user property
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div>No user found</div>

  const { data: prop } = await supabase
    .from('propiedad')
    .select('id')
    .eq('usuario_id', user.id)
    .maybeSingle()

  if (!prop) return <div>No property found</div>

  // 2. Fetch Dashboard Data (User Progress, Resources, Queue)
  const dashboardData = await getDashboardData(prop.id)

  // 3. Fetch Static Configs
  const { data: configs } = await supabase
    .from('configuracion_entrenamiento')
    .select('*')
    .order('nombre')

  // 4. Fetch Requirements
  const { data: requirements } = await supabase
    .from('requisito_entrenamiento')
    .select('*')

  // 5. Fetch Active Queue specifically for this property if not fully reliable from dashboardData
  const { data: realQueue } = await supabase
      .from('cola_investigacion')
      .select('*')
      .eq('propiedad_id', prop.id)
      .maybeSingle()

  if (!dashboardData || !configs) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>No se pudieron cargar los datos.</AlertDescription>
        </Alert>
    )
  }

  // Transform Resources
  const simpleResources: Recursos = {
      armas: dashboardData.recursos.armas.val,
      municion: dashboardData.recursos.municion.val,
      alcohol: dashboardData.recursos.alcohol.val,
      dolares: dashboardData.recursos.dolares.val
  }

  return (
    <div className="space-y-4">
        <Card className="border-primary bg-stone-200 text-black">
            <CardHeader className="bg-primary/80 py-2 px-4 flex flex-row items-center gap-2">
                <Construction className="w-6 h-6 text-primary-foreground" />
                <CardTitle className="text-lg text-primary-foreground">
                    Centro de Investigación (Tech Tree)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <TechTreeView 
                  configs={configs}
                  requirements={requirements || []}
                  userResearch={dashboardData.investigaciones || []}
                  queue={realQueue as ColaInvestigacion | null} 
                  activeQueueItem={realQueue as ColaInvestigacion}
                  resources={simpleResources}
                  propertyId={prop.id}
               />
            </CardContent>
        </Card>
    </div>
  )
}
