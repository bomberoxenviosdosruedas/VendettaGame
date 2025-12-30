🏗️ ESPECIFICACIÓN TÉCNICA: Resolución de Incidentes 406 (PGRST116)
Rol Asignado: Full Stack Developer / Supabase Expert
Contexto: Se ha reportado un incidente recurrente en los logs de producción con el código de estado `406 Not Acceptable` y error interno `PGRST116`.
Log de referencia:
```json
"event_message": "GET | 406 | ... | /rest/v1/propiedad?select=id&usuario_id=eq....",
"proxy_status": "PostgREST; error=PGRST116"
```
Este error indica que se está realizando una consulta a la tabla `propiedad` esperando un resultado único (`application/vnd.pgrst.object+json`, que corresponde a `.single()`), pero la base de datos no está devolviendo ninguna fila (el usuario no tiene propiedad) o devuelve múltiples. Dado que es una consulta por `usuario_id` (que debería ser único por propiedad o inexistente), y el error ocurre en flujos de inicialización, se deduce que el uso de `.single()` es incorrecto para casos donde la ausencia de datos es un estado válido.

🧠 Análisis de Contexto (Automático):
- **Archivo Identificado:** `src/lib/services/game.service.ts`
- **Función:** `getUserProperty(userId: string)`
- **Patrón Erróneo:** `.select('id').eq('usuario_id', userId).single()`
- **Solución Técnica:** Cambiar a `.maybeSingle()`, el cual retorna `null` (sin error) cuando no hay coincidencias, evitando el ruido en los logs y el status 406.

📦 ARCHIVOS A INTERVENIR
src/lib/services/game.service.ts (Refactorización)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Corrección del Servicio]
Acción: Modificar `src/lib/services/game.service.ts`.
Detalle:
1.  Ubicar la función `getUserProperty`.
2.  Cambiar el modificador de la consulta Supabase:
    - **Antes:** `.single()`
    - **Ahora:** `.maybeSingle()`
3.  Limpiar el manejo de errores:
    - Ya no es necesario ignorar explícitamente el error si devuelve null data, pues `maybeSingle` no lanza error en ese caso.
    - Mantener el check `if (error)` para errores reales (conexión, permisos).

Snippet de referencia:
```typescript
export async function getUserProperty(userId: string): Promise<string | null> {
  const supabase = await createClient()
  // FIX: Usar maybeSingle() para manejar usuarios sin propiedad sin generar error 406/PGRST116
  const { data, error } = await supabase
    .from('propiedad')
    .select('id')
    .eq('usuario_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error checking user property:', error)
    return null
  }

  // data será null si no existe, o el objeto si existe
  return data?.id || null
}
```

✅ CRITERIOS DE ACEPTACIÓN
- La llamada a `getUserProperty` no debe generar entradas de error `406` en el log de Supabase cuando el usuario no tiene propiedad.
- La funcionalidad debe mantenerse intacta: retornar `id` si existe, `null` si no.
- El código debe estar limpio de comentarios "parche" que suprimían errores esperados, ya que el error ya no ocurrirá.

🛡️ REGLAS DE ORO
Runtime: Bun.
Supabase Best Practice: Usar `.maybeSingle()` para consultas de "0 o 1" resultados esperados. Usar `.single()` solo cuando "0" resultados deba considerarse una excepción fatal.
