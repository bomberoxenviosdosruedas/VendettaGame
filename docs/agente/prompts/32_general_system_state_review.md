🏗️ ESPECIFICACIÓN TÉCNICA: Auditoría General del Estado del Sistema
Rol Asignado: Lead System Auditor
Contexto: El proyecto ha crecido y evolucionado. Es crítico realizar un "Check-up" completo para asegurar que no se ha acumulado deuda técnica invisible, que se respeta el "Stack Tecnológico Inmutable" (Bun, Next.js 15, Supabase), y que la arquitectura "Database for Truth" sigue intacta.

🧠 Análisis de Contexto (Automático):
- Input: `docs/specs/vision_arquitectura_moderna.md`, `scripts/contexto/*.json`.
- Codebase: `src/`, `supabase/migrations/`, `docs/`.
- Objetivo: Generar un informe de auditoría exhaustivo que valide la integridad del sistema actual.

📦 ARCHIVOS A INTERVENIR
docs/reports/auditoria_general_estado_sistema.md (Generar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Auditoría de Infraestructura y Stack]
Acción: Verificar cumplimiento estricto.
Detalle:
1.  **Runtime Check:** Confirmar que no hay dependencias de Node.js/npm/yarn hardcodeadas (solo Bun).
2.  **Framework:** Verificar uso correcto de Next.js 15+ (App Router, no `pages/`).
3.  **Database:** Revisar que la lógica crítica reside en RPCs y no en el cliente.
4.  **Estructura:** Validar convención de nombres (snake_case en BD, camelCase en TS) y organización de carpetas.

[Fase 2: Auditoría de Seguridad y Datos]
Acción: Análisis estático de riesgos.
Detalle:
1.  **RLS:** Verificar que TODAS las tablas (excepto estáticas públicas) tengan RLS habilitado y policies definidas.
2.  **RPC Security:** Buscar funciones `SECURITY DEFINER` que falten `SET search_path = ''` (Vulnerabilidad crítica).
3.  **Inyección:** Confirmar que no hay SQL dinámico inseguro en los RPCs.
4.  **Tipado:** Verificar uso de Zod en Server Actions para validación de entrada.

[Fase 3: Auditoría de Código y Calidad]
Acción: Revisión de patrones y deuda técnica.
Detalle:
1.  **Hardcoded Data:** Detectar arrays estáticos o "Magic Numbers" que deberían estar en la BD o constantes.
2.  **Duplicidad:** Identificar lógica repetida entre Server Actions y RPCs.
3.  **Comentarios/TODOs:** Recopilar deuda técnica marcada en el código (`// TODO`, `// FIXME`).
4.  **Manejo de Errores:** Verificar que se usa `.maybeSingle()` correctamente y se gestionan excepciones.

[Fase 4: Generación del Informe]
Acción: Escribir `docs/reports/auditoria_general_estado_sistema.md`.
Estructura:
1.  **Resumen del Estado:** Semáforo (Verde/Amarillo/Rojo) por categoría (Seguridad, Arquitectura, Calidad).
2.  **Hallazgos Críticos:** Lista priorizada de problemas que requieren atención inmediata.
3.  **Violaciones de Estilo/Arquitectura:** Desviaciones del manual "Vision Arquitectura Moderna".
4.  **Recomendaciones:** Pasos concretos para remediar los hallazgos.

✅ CRITERIOS DE ACEPTACIÓN
- El informe debe ser honesto y directo.
- Debe identificar archivos específicos (rutas completas) para cada hallazgo.
- Debe validar explícitamente la seguridad de los RPCs críticos (`iniciar_construccion`, `iniciar_entrenamiento`).

🛡️ REGLAS DE ORO
- Verdad ante todo: Si algo está mal, repórtalo.
- Contexto: Considera que `scripts/contexto/` es la fuente de verdad de la BD.
- Seguridad: Prioridad máxima a fallos de RLS o Search Path.
