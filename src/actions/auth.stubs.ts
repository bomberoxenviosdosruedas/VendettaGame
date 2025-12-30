'use server'

export async function forgotPassword(prevState: any, formData: FormData) {
  // Return undefined for errors to match the expected type somewhat, or empty object
  // But Typescript seems to think state.errors is 'never' or something?
  // Let's explicitly return the shape.
  return { 
      message: 'Not implemented', 
      errors: {} as Record<string, string[]> // Cast to satisfy potential users
  }
}

export async function socialLogin(provider: string) {
    console.log('Social login with', provider);
}

export async function resetPassword(prevState: any, formData: FormData) {
  return { 
      message: 'Not implemented', 
      errors: {} as Record<string, string[]>
  }
}
