🏗️ ESPECIFICACIÓN TÉCNICA: Generación de Informe Funcional Detallado (Vendetta)
Rol Asignado: Lead Game Designer / Technical Writer
Contexto: Se requiere un "Manual de Referencia Funcional" del juego Vendetta. Este documento debe describir exhaustivamente la mecánica del juego, los activos (edificios, tropas, investigaciones), la economía y las acciones posibles, **sin** entrar en detalles de implementación técnica (rutas de archivos, nombres de variables). Debe servir como la "Biblia del Juego" para diseñadores y nuevos desarrolladores.

🧠 Análisis de Contexto (Automático):
- Fuentes de Verdad: 
  - `src/types/database.ts` (Estructura de datos).
  - `src/lib/constants.ts` (Reglas estáticas).
  - `docs/specs/vision_arquitectura_moderna.md` (Mecánicas de alto nivel).
  - Archivos JSON en `src/data/` o `scripts/contexto/` si contienen configuraciones de juego.

📦 ARCHIVOS A INTERVENIR
docs/reports/informe_funcional_vendetta.md (Generar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Recopilación de Datos]
Acción: Analizar la configuración del juego.
Detalle:
- Identificar los 4 recursos principales y su rol.
- Listar todas las "Habitaciones" (Edificios), sus costos relativos y función (producción, almacenamiento, defensa).
- Listar todas las "Tropas", sus stats (ataque, defensa, velocidad, carga) y roles (ofensivo, defensivo, espionaje).
- Listar los "Entrenamientos" (Investigaciones) y qué desbloquean o mejoran.

[Fase 2: Redacción del Informe]
Acción: Escribir `docs/reports/informe_funcional_vendetta.md`.
Estructura del Informe:
1.  **Introducción:** Resumen del lore y objetivo (Juego de estrategia mafiosa en tiempo real).
2.  **Economía:**
    - Explicar el ciclo: Armas/Munición (Militar) vs Alcohol/Dólares (Económico).
    - Mecánica de Producción (por hora/segundo) y Almacenamiento (Límites).
3.  **Infraestructura (Habitaciones):**
    - Tabla o lista detallada de cada habitación.
    - Árbol de dependencias (ej: "Requiere Oficina del Jefe Nvl 3").
    - Acciones: "Ampliar" (Construcción).
4.  **Fuerzas Armadas (Tropas):**
    - Categorías: Infantería, Vehículos, Especialistas (Espías).
    - Estadísticas clave explicadas.
    - Acción: "Reclutar".
5.  **I+D (Entrenamientos):**
    - Ramas tecnológicas.
    - Beneficios globales (ej: "Mejora velocidad de disparo").
6.  **Acciones y Misiones:**
    - **Ataque:** Cálculo de combate, saqueo de recursos.
    - **Espionaje:** Obtención de información vs Riesgo de detección.
    - **Transporte:** Movimiento de recursos entre propiedades.
    - **Ocupación/Fundar:** Expansión territorial.
7.  **Mecánicas de Tiempo:**
    - Colas de espera (Construcción, Reclutamiento).
    - Tiempos de viaje en el mapa.

✅ CRITERIOS DE ACEPTACIÓN
- El lenguaje debe ser funcional ("El Almacén guarda recursos"), no técnico ("La tabla storage tiene columna value").
- Debe ser exhaustivo: No olvidar ninguna tropa o edificio definido en la configuración actual.
- Formato Markdown limpio con tablas para los datos numéricos.

🛡️ REGLAS DE ORO
Fuente: La verdad está en los datos (`configuracion_...`), no inventar mecánicas.
Estilo: Manual de Juego Profesional.
Exclusión: No mencionar "Supabase", "React", "Next.js" ni rutas de archivos.
