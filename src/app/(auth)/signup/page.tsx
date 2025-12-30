import { SignupForm } from '@/components/auth/signup/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <>
      <SignupForm />
      <div className="mt-4 text-center text-sm">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="underline text-accent hover:text-accent/90">
          Inicia Sesión
        </Link>
      </div>
    </>
  )
}
