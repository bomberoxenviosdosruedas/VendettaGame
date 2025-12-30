🏗️ ESPECIFICACIÓN TÉCNICA: Fix Missing RLS Policy for `cola_eventos_flota`
Rol Asignado: Database Security Specialist
Contexto: El linter de base de datos reporta una alerta de seguridad (`rls_enabled_no_policy`) para la tabla `public.cola_eventos_flota`. RLS está habilitado, pero no existen políticas definidas, lo cual es una configuración ambigua (implícitamente deniega todo, pero debería ser explícito). Esta tabla es utilizada internamente por el sistema para gestionar eventos de flotas y no parece tener accesos directos desde el cliente (frontend). Se debe crear una política que restrinja explícitamente el acceso o lo documente como "solo sistema".

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `public.cola_eventos_flota`.
- Funciones Existentes: No hay funciones RPC que expongan esta tabla directamente al usuario.
- Estado Actual: RLS habilitado en `20250211_000000_consolidated_logic.sql`, pero sin políticas `CREATE POLICY`.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/20250525000001_fix_rls_cola_eventos.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Crear nueva migración `supabase/migrations/20250525000001_fix_rls_cola_eventos.sql`.
Detalle:
1.  Crear una política explícita para `service_role` en `cola_eventos_flota`. Aunque `service_role` omite RLS, esto silencia el linter y documenta el propósito.
2.  (Opcional pero recomendado) Crear una política explícita de "Deny" para `public` (authenticated/anon) para dejar claro que los usuarios no deben tocarla, o confiar en el default deny. Para satisfacer el linter "no policy", basta con la del `service_role` o una explícita `deny`.
3.  Estrategia elegida: Crear política que permita todo al rol de servicio y nada a los demás.

```sql
-- Permitir acceso completo al rol de servicio (backend/workers)
CREATE POLICY "service_role_manage_all" ON public.cola_eventos_flota
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Denegar acceso explícito a usuarios autenticados (opcional, ya que default es deny, pero mejora claridad)
-- Nota: Supabase Linter se satisface con al menos una política.
```

[Fase 2: Service Layer - Next.js]
Acción: Ninguna.

[Fase 3: UI Layer - React]
Acción: Ninguna.

✅ CRITERIOS DE ACEPTACIÓN
- La tabla `public.cola_eventos_flota` debe tener al menos una política RLS asociada.
- El acceso público (anon/authenticated) debe permanecer bloqueado (verificar que no se use `TO public USING (true)`).
- El linter `rls_enabled_no_policy` debe desaparecer para esta tabla.

🛡️ REGLAS DE ORO
Runtime: Bun.
Framework: Next.js 15+ (Server Actions).
DB: Supabase (PostgreSQL).
Contexto: Consultar `scripts/contexto` antes de asumir nada.
