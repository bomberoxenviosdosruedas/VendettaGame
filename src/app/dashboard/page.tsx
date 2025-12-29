import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const signOut = async () => {
    'use server'
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Bienvenido a Vendetta</CardTitle>
          <CardDescription>
            Estás conectado como {user.email}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col space-y-4">
            <p>Este es tu panel de control. ¡Más funciones próximamente!</p>
            <form action={signOut}>
              <Button type="submit" className="w-full">
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
