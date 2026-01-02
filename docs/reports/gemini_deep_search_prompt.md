**Prompt:**

"Actúa como un Arquitecto de Software Senior especializado en el desarrollo de videojuegos MMO de estrategia en tiempo real (MMORTS) tipo OGame o Travian.

Tengo un proyecto en desarrollo utilizando **Next.js 15 (App Router)** y **Supabase (PostgreSQL)**. Adjunto encontrarás dos documentos técnicos exhaustivos:
1.  `database_schema.md`: El esquema COMPLETO de la base de datos, incluyendo tipos, constraints y triggers.
2.  `formulas_audit.md`: Una auditoría detallada con tablas de valores exactos y bloques de código PL/pgSQL extraídos del sistema actual.

**Objetivo de la Investigación:**
Necesito que realices una búsqueda profunda ("Deep Search") y análisis crítico para responder las siguientes preguntas, comparando mi implementación con los estándares de la industria.

**Puntos a Investigar:**

1.  **Optimización de Fórmulas Matemáticas (Critical):**
    *   En `formulas_audit.md` verás que mis costos son **estáticos** (ej: Mina Nivel 50 cuesta lo mismo que Nivel 1). Esto es un error de diseño grave.
    *   Provee la fórmula matemática estándar (exponencial) más eficiente para: Costos de Construcción, Producción de Recursos y Tiempos.
    *   Escribe el código SQL (Snippet) para reemplazar mi lógica estática actual (`v_costo := config.costo`) por una fórmula dinámica (`config.costo * 1.5 ^ nivel`).

2.  **Arquitectura "Game Loop" & PvP:**
    *   Mi tabla `cola_misiones` (ver `database_schema.md`) usa JSONB para tropas y no tiene índices GIN. ¿Cómo afectará esto el rendimiento cuando haya 10,000 misiones activas?
    *   El sistema actual no procesa batallas si el usuario no hace login (Lazy). Diseña una solución usando `pg_cron` que pueda procesar miles de llegadas de flotas por minuto sin bloquear la base de datos.

3.  **Integridad de Datos (Single Source of Truth):**
    *   Actualmente tengo los datos duplicados en `src/lib/constants.ts` y en la tabla `configuracion_habitacion`.
    *   Recomienda una estrategia para generar los archivos de constantes TypeScript automáticamente desde la base de datos (Code Generation) en el CI/CD, para eliminar la duplicidad manual.

4.  **Seguridad RPC:**
    *   Mis funciones RPC son `SECURITY DEFINER`. Basado en el esquema, ¿cómo puedo prevenir que un usuario llame a `iniciar_reclutamiento` con el ID de propiedad de otro usuario? (Verifica si el esquema actual tiene esa vulnerabilidad).

**Entregable:**
Genera un informe técnico con:
1.  Las fórmulas matemáticas corregidas (LaTeX + SQL).
2.  Un diseño de índices para la tabla `cola_misiones`.
3.  Un ejemplo de script `pg_cron` para el motor de combate.
4.  Estrategia de Code Gen para los tipos."
