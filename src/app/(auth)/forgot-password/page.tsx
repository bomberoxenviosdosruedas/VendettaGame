import { ForgotPasswordForm } from './forgot-password-form'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordForm />
      <div className="mt-4 text-center text-sm">
        ¿Recordaste tu contraseña?{' '}
        <Link href="/login" className="underline text-accent hover:text-accent/90">
          Inicia Sesión
        </Link>
      </div>
    </>
  )
}
