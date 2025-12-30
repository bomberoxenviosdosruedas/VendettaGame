🏗️ ESPECIFICACIÓN TÉCNICA: Refactorización de Needles (Estadísticas)
Rol Asignado: Frontend Developer
Contexto: El componente `src/components/dashboard/needles.tsx` muestra estadísticas falsas ("Cantidad de edificios: 1", "Puntos de construcción: 7"). Debe ser refactorizado para consumir el contexto global `GameStateContext` y reflejar la realidad del usuario.

🧠 Análisis de Contexto (Automático):
- **Origen de Datos:** `useGameState()` -> `gameState`.
- **Datos Requeridos:**
  - Cantidad de edificios construidos (`gameState.edificios.length` o filtrado por nivel > 0).
  - Puntos de construcción (`gameState.puntos`).
  - (Opcional) Ranking global (si estuviera disponible, si no, ocultar o mostrar "-").

📦 ARCHIVOS A INTERVENIR
src/components/dashboard/needles.tsx (Refactorizar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Frontend Layer]
Acción: Modificar `src/components/dashboard/needles.tsx`.
Detalle:
1.  Importar `useGameState`.
2.  Eliminar la constante `stats` con datos fijos.
3.  Calcular estadísticas reales:
    - `totalEdificios`: `gameState.edificios.filter(e => e.nivel > 0).length`.
    - `totalPuntos`: `gameState.puntos`.
    - `ranking`: "N/A" (o eliminar si no existe en API).
4.  Renderizar valores dinámicos.
5.  Manejar estado de carga (`if (!gameState) return <Skeleton />`).

✅ CRITERIOS DE ACEPTACIÓN
- El widget "Needles" debe mostrar el número exacto de edificios que posee el usuario.
- Debe mostrar los puntos reales del usuario.
- No debe contener strings numéricos hardcodeados.

🛡️ REGLAS DE ORO
Runtime: Bun.
UI: Mantener el diseño visual existente (Cards/Stats), solo cambiar el origen de los datos.
