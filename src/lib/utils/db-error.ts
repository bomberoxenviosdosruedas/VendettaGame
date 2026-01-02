/**
 * Utility to sanitize database errors and return user-friendly messages.
 * Prevents leaking raw database error details to the client.
 */
export function sanitizeDatabaseError(error: unknown): string {
  if (!error) return 'Ha ocurrido un error desconocido.';

  // If the error is already a string
  if (typeof error === 'string') {
    // If it looks like a raw database error message, sanitize it.
    const lowerError = error.toLowerCase();
    if (
      lowerError.includes('violate') ||
      lowerError.includes('constraint') ||
      lowerError.includes('syntax') ||
      lowerError.includes('relation') ||
      lowerError.includes('column') ||
      lowerError.includes('function')
    ) {
       return 'Ha ocurrido un error técnico. Por favor intenta de nuevo.';
    }
    // Otherwise assume it is a safe application error message
    return error;
  }

  const err = error as { code?: string; message?: string; details?: string; hint?: string };

  // Handle specific Postgres error codes
  if (err.code) {
    switch (err.code) {
      case '42501': // insufficient_privilege
        return 'No tienes permisos para realizar esta acción.';
      case '23505': // unique_violation
        return 'Ya existe un registro con estos datos.';
      case '23503': // foreign_key_violation
        return 'Operación inválida: referencia a datos inexistentes.';
      case '23502': // not_null_violation
        return 'Faltan datos requeridos.';
      case '40P01': // deadlock_detected
        return 'El sistema está ocupado, por favor intenta de nuevo.';
      case '57014': // query_canceled
        return 'La operación tardó demasiado y fue cancelada.';
      case 'PGRST116':
        return 'No se encontraron los datos solicitados.';
      // Add more codes as needed
    }
  }

  // Handle network-like errors
  if (err.message) {
      if (
          err.message.includes('fetch failed') ||
          err.message.includes('network') ||
          err.message.includes('connection')
        ) {
        return 'Error de conexión con el servidor.';
      }

      // If we couldn't match a code, but we have a message, it might be a raw DB message.
      // We apply the same string heuristics.
      const lowerMsg = err.message.toLowerCase();
       if (
          lowerMsg.includes('violate') ||
          lowerMsg.includes('constraint') ||
          lowerMsg.includes('syntax') ||
          lowerMsg.includes('relation') ||
          lowerMsg.includes('column') ||
          lowerMsg.includes('function')
        ) {
           return 'Ha ocurrido un error técnico en la base de datos.';
        }
  }

  // Fallback generic message
  return 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.';
}
