'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { resetPassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

const initialState = {
  message: '',
  errors: undefined,
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Restableciendo...' : 'Restablecer Contraseña'}
    </Button>
  )
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(resetPassword, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state?.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      })
    }
  }, [state, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña a continuación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">{state.errors.password[0]}</p>
            )}
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
