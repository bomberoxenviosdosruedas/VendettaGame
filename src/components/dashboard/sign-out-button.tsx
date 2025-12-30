'use client'

import { signOutAction as signOut } from '@/actions/auth.actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="secondary" size="sm" className="w-full justify-start text-white bg-stone-700 hover:bg-stone-600">
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </form>
  )
}
