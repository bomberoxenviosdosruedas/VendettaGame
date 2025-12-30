'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { signup } from '@/lib/actions/auth'
import { SocialButtons } from '@/components/auth/social-buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { SocialButtons } from '@/app/(auth)/social-buttons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

const initialState = {
  message: '',
  errors: undefined,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creando cuenta...' : 'Crear una cuenta'}
    </Button>
  )
}

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState)
  const { toast } = useToast()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state?.message && !state.errors) {
      setShowSuccess(true)
    } else if (state?.message) {
      toast({
        title: 'Error de registro',
        description: state.message,
        variant: 'destructive',
      })
    }
  }, [state, toast])

  if (showSuccess) {
    return (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>¡Hecho!</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Registrarse</CardTitle>
        <CardDescription>
          Ingresa tu información para crear una cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
            />
             {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          <SubmitButton />
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div>
        <SocialButtons />
      </CardContent>
    </Card>
  )
}
