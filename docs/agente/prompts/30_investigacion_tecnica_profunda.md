🏗️ ESPECIFICACIÓN TÉCNICA: Investigación Técnica Profunda y Plan de Optimización
Rol Asignado: Principal Software Architect
Contexto: Se ha definido una "Visión de Arquitectura Moderna" (`docs/specs/vision_arquitectura_moderna.md`) para el proyecto, que establece el uso de Next.js 16 (App Router, Server Actions, Optimistic UI), Supabase (RLS, RPCs, Realtime), y lógicas avanzadas de juego (Lazy Evaluation, Zero Trust). Necesitamos un análisis profundo ("Gap Analysis") entre el código actual y esta visión, seguido de un plan de optimización concreto.

🧠 Análisis de Contexto (Automático):
- Input: `docs/specs/vision_arquitectura_moderna.md`.
- Codebase: Todo el directorio `src/` y `supabase/migrations/`.
- Objetivo: Elevar el estándar del código actual para cumplir o exceder la visión propuesta.

📦 ARCHIVOS A INTERVENIR
docs/reports/plan_optimizacion_2025.md (Generar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Ingesta y Análisis]
Acción: Leer y comprender la visión vs realidad.
Detalle:
1.  Leer `docs/specs/vision_arquitectura_moderna.md`.
2.  Analizar el código actual (especialmente `src/lib/actions`, `src/hooks`, y migraciones recientes).
3.  Identificar áreas de mejora en:
    - **Performance:** ¿Estamos usando `React.cache`? ¿El fetching es paralelo? ¿Hay waterfalls?
    - **Arquitectura:** ¿El código frontend está desacoplado de la lógica? ¿Las Server Actions son puras?
    - **Base de Datos:** ¿Las funciones RPC usan `SECURITY DEFINER` correctamente? ¿La "Lazy Evaluation" está bien implementada (`procesar_colas_propiedad`)?
    - **UX:** ¿Se usa `useOptimistic` en todas las mutaciones críticas?

[Fase 2: Investigación de Técnicas]
Acción: Proponer soluciones modernas.
Detalle:
- Investigar y proponer el uso de **Next.js 16 Partial Prerendering (PPR)** si es viable.
- Evaluar patrones de **Composability** para los componentes del dashboard.
- Revisar si el manejo de estado global (`useGameState`) puede optimizarse con **Jotai Atoms** o **Zustand** para evitar re-renders masivos.
- Analizar estrategias de **Cache Revalidation** inteligente (`revalidateTag` vs `revalidatePath`).

[Fase 3: Generación del Informe]
Acción: Escribir `docs/reports/plan_optimizacion_2025.md`.
Estructura:
1.  **Resumen Ejecutivo:** Estado actual vs Objetivo.
2.  **Gap Analysis:** Tabla comparativa (Feature | Implementación Actual | Mejora Propuesta | Impacto).
3.  **Plan de Acción Técnica:**
    - **Frente 1: Core Engine (DB):** Optimizaciones SQL, índices, refactor de RPCs para atomicidad estricta.
    - **Frente 2: Frontend Performance:** Server Components, Streaming, Optimistic Updates.
    - **Frente 3: Developer Experience:** Tipado estricto (Zod), tests (Vitest), CI/CD.
4.  **Recomendaciones Específicas:**
    - Código de ejemplo para implementar un patrón recomendado (ej: Un `useOptimisticAction` genérico).
    - Sugerencia de refactor para `procesar_colas_propiedad`.

✅ CRITERIOS DE ACEPTACIÓN
- El informe debe ser técnico, profundo y crítico.
- No solo listar problemas, sino dar soluciones arquitectónicas concretas.
- Referenciar archivos específicos del proyecto actual que necesitan cambios.

🛡️ REGLAS DE ORO
Objetividad: Basarse en el código existente.
Modernidad: Asumir Next.js 15/16 + React 19 features (si están disponibles en el entorno).
Foco: Priorizar la experiencia de "Juego en Tiempo Real" y "Persistencia Segura".
