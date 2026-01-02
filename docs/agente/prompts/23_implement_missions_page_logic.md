🏗️ ESPECIFICACIÓN TÉCNICA: Módulo de Misiones (Frontend)
Rol Asignado: Frontend Logic Architect
Contexto: Se requiere implementar la interfaz de usuario para la planificación y visualización de misiones (`/dashboard/missions`). Este módulo debe permitir al usuario seleccionar tropas, calcular tiempos y costos en tiempo real, y enviar misiones al servidor. También debe mostrar el estado de las misiones activas (salientes y entrantes).

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas (snake_case): `cola_misiones`, `propiedad`, `tropa_propiedad`, `ataque_entrante`.
- RPCs Disponibles: `enviar_mision_atomica` (identificado en legacy `mission.actions.ts`).
- Hooks: `useGameState` (para tropas disponibles y misiones activas).
- Referencia Legada: `src/lib/actions/mission.actions.ts` (Legacy) contiene la lógica de validación Zod y llamada RPC que debemos adaptar al nuevo stack.

📦 ARCHIVOS A INTERVENIR
src/app/dashboard/missions/page.tsx (Crear: Wrapper Page)
src/components/dashboard/missions/missions-view.tsx (Crear: Main Client Component)
src/components/dashboard/missions/mission-planner.tsx (Crear: Formulario y Calculadora)
src/components/dashboard/missions/active-missions-list.tsx (Crear: Listado)
src/lib/actions/mission.actions.ts (Crear/Adaptar: Server Actions)
src/lib/schemas/mission.schema.ts (Crear: Zod Schema)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Esquemas y Validaciones]
Acción: Crear `src/lib/schemas/mission.schema.ts`.
Detalle:
- Definir `MissionInputSchema` con Zod.
- Campos: `propiedad_origen_id` (UUID) [Nota: Mapeado de `origenPropiedadId`], `coordinates` object ({ciudad, barrio, edificio}), `tropas` array ({id, cantidad}), `tipo` (enum: 'atacar', 'transportar', 'espiar', 'colonizar', 'recolectar').
- Validaciones: Coordenadas positivas, cantidad > 0.

[Fase 2: Server Actions]
Acción: Crear `src/lib/actions/mission.actions.ts`.
Detalle:
- Implementar `sendMissionAction(data: MissionInput)`.
- Validar sesión (`getSessionUser`).
- Validar input con Zod.
- Llamar a RPC `enviar_mision_atomica`.
- Parámetros RPC: `p_user_id`, `p_origen_id`, `p_destino_coords` (json), `p_tropas` (json), `p_tipo`.
- Manejar errores y `revalidatePath`.

[Fase 3: Componente Planificador (Planner)]
Acción: Crear `src/components/dashboard/missions/mission-planner.tsx`.
Detalle:
- Props: `tropasDisponibles` (de `useGameState` -> tabla `tropa_propiedad`), `propiedadActual`.
- State: `selectedTroops` (Map<id, quantity>), `targetCoords`.
- **Lógica de Cálculo (Client-Side)**:
  - Usar `useEffect` para recalcular cuando cambian tropas/coords.
  - `tiempoViaje = max(distancia / velocidad_mas_lenta)`.
  - `costo = distancia * consumo_total`.
  - `capacidad = sum(cantidad * capacidad_unitaria)`.
- **UI**:
  - Sliders por cada tipo de tropa disponible (iterar `tropasDisponibles`).
  - Inputs para coordenadas (C:B:E).
  - Preview de estadísticas (Tiempo, Costo, Capacidad).
  - Botón "Enviar Misión" (disparar Server Action).

[Fase 4: Componente de Listado]
Acción: Crear `src/components/dashboard/missions/active-missions-list.tsx`.
Detalle:
- Props: `misiones` (ActiveMission[] -> tabla `cola_misiones`), `ataques` (IncomingAttack[] -> tabla `ataque_entrante`).
- Renderizar dos pestañas o secciones: "Misiones Propias" y "Amenazas".
- Usar componentes de `Countdown` para el tiempo restante.
- Botón "Cancelar" (si aplica lógica de retorno, llamar a action de cancelación).

[Fase 5: Integración en Page]
Acción: Crear `src/app/dashboard/missions/page.tsx` y `src/components/dashboard/missions/missions-view.tsx`.
Detalle:
- `page.tsx`: Server Component. Fetch inicial de datos (opcional si `useGameState` maneja todo, pero útil para hidratación).
- `missions-view.tsx`: Client Component.
  - Usa `useGameState` para obtener `tropas` (map `tropa_propiedad`) y `colas.misiones` (`cola_misiones`).
  - Renderiza `<MissionPlanner />` y `<ActiveMissionsList />`.

✅ CRITERIOS DE ACEPTACIÓN
- El planificador no permite seleccionar más tropas de las disponibles en `tropa_propiedad`.
- El cálculo de tiempo se actualiza instantáneamente al mover el slider.
- Al enviar, se muestra toast de éxito/error y la lista de misiones se actualiza (vía realtime o revalidate).
- Las coordenadas de destino se validan (1-150, etc.).
- Uso estricto de nombres de tabla en snake_case (`cola_misiones`, `ataque_entrante`) para evitar errores de tipo.

🛡️ REGLAS DE ORO
Runtime: Bun.
Estilo: Shadcn UI (Sliders, Tabs, Cards).
Lógica: La "verdad" del combate/movimiento reside en la BD (RPC), el cliente solo estima.
Seguridad: Validar propiedad de origen en el servidor.
