'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { forgotPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
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
      {pending ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
    </Button>
  )
}

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPassword, initialState)
  const { toast } = useToast()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (state?.message && !state.errors) {
      setShowSuccess(true)
    } else if (state?.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      })
    }
  }, [state, toast])

  if(showSuccess) {
    return (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>¡Revisa tu correo!</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
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
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
