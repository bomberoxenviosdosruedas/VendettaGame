import { LoginForm } from '@/components/auth/login/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <div className="mt-4 text-center text-sm">
        ¿No tienes una cuenta?{' '}
        <Link href="/signup" className="underline text-accent hover:text-accent/90">
          Regístrate
        </Link>
      </div>
    </>
  )
}
