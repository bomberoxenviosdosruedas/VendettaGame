'use client'

import { signOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </form>
  )
}
