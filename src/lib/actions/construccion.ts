'use server';

import { createClient } from '@/lib/supabase/server';
import { IniciarConstruccionSchema } from '@/types/game';

export async function iniciarConstruccionHabitacion(
  propiedad_id: string,
  habitacion_id: string
) {
  const supabase = createClient();

  // 1. Validar las entradas
  const validatedFields = IniciarConstruccionSchema.safeParse({
    propiedad_id,
    habitacion_id,
  });

  if (!validatedFields.success) {
    return {
      error: 'Campos inválidos.',
    };
  }

  const { data: parsedData } = validatedFields;

  try {
    // 2. Llamar a la función RPC de la base de datos
    const { data, error } = await supabase.rpc('iniciar_construccion_habitacion', {
      p_propiedad_id: parsedData.propiedad_id,
      p_habitacion_id: parsedData.habitacion_id,
    });

    if (error) {
      console.error('Error al iniciar construcción:', error);
      // El error de la base de datos puede contener información sensible,
      // devolvemos un mensaje genérico o uno específico si es seguro.
      return {
        error: 'No se pudo iniciar la construcción. Inténtalo de nuevo.',
      };
    }

    // El RPC puede devolver un JSON con un campo de error específico
    if (data && typeof data === 'object' && 'error' in data) {
        return {
            error: data.error,
        };
    }

    // 3. Devolver una respuesta exitosa
    return {
      success: true,
      data,
    };
  } catch (e) {
    console.error('Excepción al llamar a RPC:', e);
    return {
      error: 'Ocurrió un error inesperado en el servidor.',
    };
  }
}
