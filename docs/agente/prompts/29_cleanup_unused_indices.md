🏗️ ESPECIFICACIÓN TÉCNICA: Gestión de Índices no Utilizados
Rol Asignado: Database Administrator
Contexto: El linter de base de datos ha reportado múltiples índices como "Unused Index". Estos índices coinciden con los creados recientemente para cubrir claves foráneas (FKs). En un entorno de desarrollo o con pocos datos, es normal que Postgres no utilice estos índices (prefiriendo Sequential Scan), lo que genera este reporte. Sin embargo, si se desea "limpiar" el esquema para satisfacer el reporte actual, se procederá a eliminarlos.

**Advertencia:** Eliminar índices de claves foráneas puede impactar el rendimiento de `DELETE` y `UPDATE` en tablas padres en producción.

🧠 Análisis de Contexto (Automático):
- Reporte: Lista masiva de índices `idx_...` con 0 uso.
- Acción Requerida: Eliminar los objetos reportados.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/YYYYMMDDHHMMSS_cleanup_unused_indices.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Limpieza de Índices]
Acción: Crear migración para eliminar índices reportados.
Detalle:
- Usar `DROP INDEX IF EXISTS public.[nombre_indice];` para cada ítem del reporte.
- Lista de índices a eliminar:
  - `idx_anuncio_familia_autor_id`
  - `idx_anuncio_familia_familia_id`
  - `idx_ataque_entrante_atacante_id`
  - `idx_ataque_entrante_defensor_id`
  - `idx_ataque_entrante_mision_id`
  - `idx_cola_construccion_habitacion_id`
  - `idx_cola_construccion_propiedad_id`
  - `idx_cola_investigacion_entrenamiento_id`
  - `idx_cola_investigacion_usuario_id`
  - `idx_cola_misiones_propiedad_origen_id`
  - `idx_cola_misiones_usuario_id`
  - `idx_cola_reclutamiento_tropa_id`
  - `idx_entrenamiento_usuario_entrenamiento_id`
  - `idx_habitacion_usuario_habitacion_id`
  - `idx_historial_acceso_usuario_id`
  - `idx_informe_batalla_atacante_id`
  - `idx_informe_batalla_defensor_id`
  - `idx_informe_espionaje_atacante_id`
  - `idx_informe_espionaje_defensor_id`
  - `idx_invitacion_familia_usuario_id`
  - `idx_mensaje_destinatario_id`
  - `idx_mensaje_informe_batalla_id`
  - `idx_mensaje_informe_espionaje_id`
  - `idx_mensaje_remitente_id`
  - `idx_miembro_familia_familia_id`
  - `idx_propiedad_usuario_id`
  - `idx_requisito_entrenamiento_entrenamiento_id`
  - `idx_requisito_entrenamiento_entrenamiento_requerido_id`
  - `idx_requisito_habitacion_habitacion_id`
  - `idx_requisito_habitacion_habitacion_requerida_id`
  - `idx_tropa_bonus_contrincante_tropa_atacante_id`
  - `idx_tropa_bonus_contrincante_tropa_defensora_id`
  - `idx_tropa_propiedad_tropa_id`
  - `idx_tropa_seguridad_propiedad_tropa_id`

✅ CRITERIOS DE ACEPTACIÓN
- La migración elimina los índices especificados si existen.
- El linter de base de datos ya no reporta "Unused Index" para estos objetos.

🛡️ REGLAS DE ORO
Runtime: SQL.
Idempotencia: Usar `IF EXISTS`.
Nota: Esta acción prioriza la limpieza del reporte sobre la optimización teórica de FKs.
