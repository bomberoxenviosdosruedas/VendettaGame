🏗️ ESPECIFICACIÓN TÉCNICA: Análisis de Inteligencia sobre Duplicidad
Rol Asignado: Senior Code Auditor
Contexto: Se ha generado un reporte técnico automatizado (`scripts/analisis/reporte_duplicados.json`) que lista objetos de base de datos definidos múltiples veces en las migraciones. Ahora necesitamos un análisis cualitativo de este JSON para determinar la gravedad de cada duplicado. No todos los duplicados son errores (ej: `CREATE OR REPLACE FUNCTION` es normal), pero otros pueden ocultar regresiones o lógica olvidada.

🧠 Análisis de Contexto (Automático):
- Input: `scripts/analisis/reporte_duplicados.json` (Debe existir previamente).
- Tarea: Comparar las versiones de código extraídas en el JSON.
- Output: `docs/reports/analisis_duplicados_YYYYMMDD.md`.

📦 ARCHIVOS A INTERVENIR
docs/reports/analisis_duplicados_20250526.md (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Ingesta de Datos]
Acción: Leer `scripts/analisis/reporte_duplicados.json`.
Detalle:
- Cargar el JSON.
- Iterar sobre la sección `detalles`.

[Fase 2: Análisis Comparativo (Mental/AI)]
Acción: Para cada objeto con múltiples definiciones, realizar las siguientes comprobaciones:
1.  **Evolución:** ¿La última definición (fecha más reciente) contiene mejoras sobre la anterior?
2.  **Regresión:** ¿La última definición ha perdido lógica crítica presente en versiones anteriores?
3.  **Redundancia:** ¿Son idénticas? (Falso positivo o re-aplicación innecesaria).
4.  **Conflicto:** ¿Cambia la firma (parámetros) de una función o las columnas de una tabla de forma incompatible?

[Fase 3: Generación de Informe Markdown]
Acción: Escribir el informe en `docs/reports/analisis_duplicados_YYYYMMDD.md`.
Estructura del Informe:
- **Resumen Ejecutivo:** Estado general de la salud de las migraciones (Semáforo: Verde/Amarillo/Rojo).
- **Hallazgos Críticos:** Lista de objetos donde la última versión parece errónea o incompleta.
- **Hallazgos Informativos:** Lista de objetos que evolucionaron correctamente (ej: fixes de seguridad).
- **Detalle Técnico:** (Para cada objeto analizado)
  - Nombre del Objeto.
  - Archivos involucrados.
  - Diferencias clave (resumidas).
  - Veredicto: "Correcto", "Atención Requerida", "Deprecar".

✅ CRITERIOS DE ACEPTACIÓN
- El informe debe ser legible para humanos y tomadores de decisiones.
- Debe resaltar explícitamente si alguna función ha perdido código (ej: validaciones de seguridad que estaban en v1 y desaparecieron en v2).
- Debe confirmar si las correcciones de RLS o Security Definer se han mantenido en la última versión.

🛡️ REGLAS DE ORO
Contexto: Utilizar el campo `code` del JSON para comparar la lógica real.
Objetividad: Basar el veredicto en la comparación de código, no en suposiciones.
Formato: Markdown limpio con bloques de código para mostrar diffs si es necesario.
