'use server'

import { z } from 'zod'
import { signUp, signIn, signOut } from '@/lib/services/auth.service'
import { redirect } from 'next/navigation'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(3),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function registerAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  
  const parsed = registerSchema.safeParse({
    email: data.email,
    password: data.password,
    fullName: data.fullName,
  })

  if (!parsed.success) {
    return {
      message: 'Error de validación',
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const result = await signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    full_name: parsed.data.fullName,
  })

  if (!result.success) {
    return {
      message: result.error || 'Error desconocido',
      errors: undefined
    }
  }

  return { message: 'Cuenta creada exitosamente. Por favor inicia sesión.' }
}

export async function loginAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())

  const parsed = loginSchema.safeParse({
    email: data.email,
    password: data.password,
  })

  if (!parsed.success) {
    return {
      message: 'Error de validación',
      errors: parsed.error.flatten().fieldErrors
    }
  }

  const result = await signIn({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (!result.success) {
    return {
      message: result.error || 'Credenciales inválidas',
      errors: undefined
    }
  }

  redirect('/dashboard')
}

export async function signOutAction() {
  await signOut()
}
