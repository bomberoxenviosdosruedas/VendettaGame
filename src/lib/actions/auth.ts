'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
})

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores en el formulario.',
    }
  }
  
  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
        message: 'Credenciales inválidas. Por favor, inténtalo de nuevo.',
    }
  }

  return redirect('/dashboard')
}

const signupSchema = z.object({
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
})

export async function signup(prevState: any, formData: FormData) {
  const origin = headers().get('origin')
  const supabase = createClient()
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores en el formulario.',
    }
  }
  
  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('User already registered')) {
        return { message: 'Este correo electrónico ya está registrado.'}
    }
    return { message: 'No se pudo crear la cuenta. Por favor, inténtalo de nuevo.' }
  }

  return { message: '¡Revisa tu correo electrónico para verificar tu cuenta!' }
}

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Correo electrónico inválido' }),
})

export async function forgotPassword(prevState: any, formData: FormData) {
    const origin = headers().get('origin')
    const supabase = createClient()
    const validatedFields = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()))

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Por favor, corrige los errores en el formulario.',
        }
    }

    const { email } = validatedFields.data

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
    })

    if (error) {
        return { message: 'No se pudo enviar el correo de restablecimiento. Por favor, inténtalo de nuevo.' }
    }

    return { message: 'Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.' }
}

const resetPasswordSchema = z.object({
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

export async function resetPassword(prevState: any, formData: FormData) {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'No estás autenticado o la sesión ha expirado.' };
    }

    const validatedFields = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Por favor, corrige los errores en el formulario.',
        }
    }
    const { password } = validatedFields.data;
    
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        return { message: 'No se pudo restablecer la contraseña. El enlace puede haber expirado.' };
    }

    redirect('/dashboard');
}

export async function socialLogin(provider: 'google' | 'github') {
  const origin = headers().get('origin')
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    // This will be caught by the nearest error boundary
    return redirect(`/login?message=No se pudo iniciar sesión con ${provider}.`)
  }
  
  return redirect(data.url)
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
