🏗️ ESPECIFICACIÓN TÉCNICA: Optimización de Base de Datos (RLS e Índices)
Rol Asignado: Database Performance Engineer
Contexto: Un análisis de rendimiento de la base de datos (Database Linter) ha detectado múltiples advertencias críticas (`WARN`) sobre políticas RLS que reevalúan funciones de autenticación innecesariamente, y advertencias informativas (`INFO`) sobre claves foráneas sin indexar. Se requiere una migración consolidada para resolver estos problemas y mejorar la escalabilidad del sistema.

🧠 Análisis de Contexto (Automático):
- Problema RLS: El uso directo de `auth.uid()` o `current_setting(...)` en las políticas obliga a Postgres a ejecutar la función por cada fila. La solución recomendada es envolver la llamada en un sub-select `(SELECT auth.uid())` para que el planificador de consultas cachee el resultado al inicio de la transacción (InitPlan).
- Problema Índices: Las claves foráneas (FK) utilizadas en JOINs o filtros no tienen índices B-Tree asociados, lo que puede causar escaneos secuenciales lentos.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/YYYYMMDDHHMMSS_optimize_rls_and_indices.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Optimización de RLS (Performance)]
Acción: Redefinir las políticas afectadas.
Detalle:
- Iterar sobre las tablas identificadas: `usuario`, `propiedad`, `cola_construccion`, `cola_investigacion`, `cola_reclutamiento`, `cola_misiones`, `mensaje`, `informe_batalla`, `informe_espionaje`, `familia`, `historial_acceso`, `puntuacion_usuario`, `errores_configuracion`, `habitacion_usuario`, `tropa_propiedad`, `tropa_seguridad_propiedad`, `entrenamiento_usuario`, `invitacion_familia`, `anuncio_familia`, `ataque_entrante`.
- Para cada política existente (ej: `modificacion_propia`), usar `DROP POLICY IF EXISTS ...` seguido de `CREATE POLICY ...`.
- **Cambio Crítico**: Reemplazar `auth.uid()` por `(SELECT auth.uid())`.
- Ejemplo:
  ```sql
  -- Antes
  USING (usuario_id = auth.uid())
  -- Después
  USING (usuario_id = (SELECT auth.uid()))
  ```

[Fase 2: Creación de Índices (Performance)]
Acción: Añadir índices a las FKs reportadas.
Detalle:
- Crear índices para las columnas foráneas detectadas.
- Usar la convención: `CREATE INDEX IF NOT EXISTS idx_[tabla]_[columna] ON public.[tabla] ([columna]);`.
- Columnas objetivo:
  - `anuncio_familia` (autor_id, familia_id)
  - `ataque_entrante` (atacante_id, defensor_id, mision_id)
  - `cola_construccion` (habitacion_id, propiedad_id)
  - `cola_investigacion` (entrenamiento_id, usuario_id)
  - `cola_misiones` (propiedad_origen_id, usuario_id)
  - `cola_reclutamiento` (tropa_id)
  - `entrenamiento_usuario` (entrenamiento_id)
  - `habitacion_usuario` (habitacion_id)
  - `historial_acceso` (usuario_id)
  - `informe_batalla` (atacante_id, defensor_id)
  - `informe_espionaje` (atacante_id, defensor_id)
  - `invitacion_familia` (usuario_id)
  - `mensaje` (destinatario_id, informe_batalla_id, informe_espionaje_id, remitente_id)
  - `miembro_familia` (familia_id)
  - `propiedad` (usuario_id)
  - `requisito_entrenamiento` (entrenamiento_id, entrenamiento_requerido_id)
  - `requisito_habitacion` (habitacion_id, habitacion_requerida_id)
  - `tropa_bonus_contrincante` (tropa_atacante_id, tropa_defensora_id)
  - `tropa_propiedad` (tropa_id)
  - `tropa_seguridad_propiedad` (tropa_id)

✅ CRITERIOS DE ACEPTACIÓN
- Todas las políticas RLS mencionadas en el reporte usan `(SELECT auth.uid())`.
- Se han creado índices para todas las FKs listadas en el reporte.
- La migración es idempotente (`IF EXISTS`, `IF NOT EXISTS`).

🛡️ REGLAS DE ORO
Runtime: SQL (PostgreSQL).
Contexto: No modificar la lógica de negocio de las políticas, solo la sintaxis de llamada a `auth`.
