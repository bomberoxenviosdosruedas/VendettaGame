🏗️ ESPECIFICACIÓN TÉCNICA: Implementación de Realtime en Dashboard (Overview, Rooms, Recruitment)
Rol Asignado: Senior Frontend Architect / Realtime Specialist
Contexto: Actualmente, las páginas de Overview, Rooms y Recruitment cargan datos estáticos o iniciales (SSR) pero no reaccionan en tiempo real a cambios en la base de datos (colas de construcción, reclutamiento, movimientos de tropas, ataques). Se requiere implementar una estrategia "Snapshot + Realtime" similar al proyecto anterior, utilizando `useGameState` como orquestador central.

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `propiedad`, `habitacion_usuario`, `cola_construccion`, `cola_reclutamiento`, `tropa_usuario`, `cola_misiones`, `incoming_attacks`.
- Funciones Existentes: `getDashboardData` (RPC/Action), `useGameRealtime` (Hook).
- Archivos de Código: 
  - `src/components/providers/game-state-provider.tsx`
  - `src/hooks/use-game-realtime.ts`
  - `src/app/dashboard/overview/page.tsx`
  - `src/app/dashboard/rooms/page.tsx`
  - `src/app/dashboard/recruitment/page.tsx`
  - `src/types/game.ts`
- Referencia Legada: `src/app/(dashboard)/overview/page.tsx`, `src/app/(dashboard)/rooms/details/page.tsx`, `src/app/(dashboard)/recruitment/details/page.tsx` del proyecto anterior.

📦 ARCHIVOS A INTERVENIR
src/types/game.ts (Modificar: Ampliar DashboardData)
src/hooks/use-game-realtime.ts (Modificar: Agregar canales de suscripción)
src/components/providers/game-state-provider.tsx (Verificar)
src/app/dashboard/overview/page.tsx (Refactorizar a Client Wrapper)
src/components/dashboard/overview/overview-dashboard.tsx (Integrar useGameState)
src/app/dashboard/rooms/page.tsx (Refactorizar a Client Wrapper)
src/components/dashboard/rooms/room-card.tsx (Hacer reactivo)
src/app/dashboard/recruitment/page.tsx (Refactorizar a Client Wrapper)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Data & Types - TypeScript]
Acción: Ampliar `DashboardData` y `useGameRealtime`.
Detalle:
1.  En `src/types/game.ts`, asegurar que `DashboardData` incluya explícitamente arrays para:
    - `cola_reclutamiento` (ColaDetalle[])
    - `cola_misiones` (ColaDetalle[])
    - `incoming_attacks` (IncomingAttack[])
    - `tropa_usuario` (TropaDetalle[])
2.  Modificar `src/hooks/use-game-realtime.ts`:
    - Agregar suscripciones a `postgres_changes` para las tablas:
      - `cola_reclutamiento` (`filter: propiedad_id=eq.${propertyId}`)
      - `tropa_usuario` (`filter: propiedad_id=eq.${propertyId}`)
      - `incoming_attacks` (`filter: defenderId=eq.${userId}`) -> Requiere userId en el contexto inicial.
      - `cola_misiones` (`filter: userId=eq.${userId}`)
    - En el callback de cada evento, invocar `refreshData()` (estrategia segura) o actualizar el estado optimista si es trivial.
    - Asegurar que el ticker de interpolación de recursos (resources interpolation) funcione correctamente.

[Fase 2: Overview Page - Next.js]
Acción: Conectar Dashboard General.
Detalle:
1.  Mantener `src/app/dashboard/overview/page.tsx` como Server Component que hace el fetch inicial (`getDashboardData`, `getIncomingAttacks`, etc.).
2.  Pasar estos datos iniciales a `OverviewDashboard` (o un nuevo wrapper `DashboardClientWrapper`).
3.  Dentro del componente cliente (`OverviewDashboard`), usar `useGameState`.
4.  Si `useGameState` devuelve null (loading), usar los datos iniciales pasados por props (Hydration pattern).
5.  Reemplazar los contadores estáticos de recursos y colas por `gameState.recursos`, `gameState.colas`.

[Fase 3: Rooms Page - Next.js]
Acción: Reactividad en Habitaciones.
Detalle:
1.  `src/app/dashboard/rooms/page.tsx`: Fetch inicial de `getDashboardData` (o solo la propiedad y habitaciones).
2.  Crear/Modificar `RoomsView` (Client Component) que reciba la data inicial.
3.  En `RoomsView`, mapear `roomsData` (configuración estática) contra `gameState.edificios` (estado real).
    - Si el edificio existe en `gameState.edificios`, mostrar su nivel real. Si no, nivel 0.
    - Verificar si está en construcción (`gameState.colas.construccion`) para mostrar barra de progreso o estado "Construyendo".
4.  El componente `RoomCard` debe recibir el nivel actual y el estado de construcción.

[Fase 4: Recruitment Page - Next.js]
Acción: Reactividad en Reclutamiento.
Detalle:
1.  `src/app/dashboard/recruitment/page.tsx`: Fetch inicial.
2.  Crear/Modificar `RecruitmentView` (Client Component).
3.  Usar `gameState.tropas` para mostrar la cantidad actual de cada unidad disponible.
4.  Usar `gameState.colas.reclutamiento` para poblar el `<Select>` de la cola de reclutamiento (reemplazando el mock `recruitmentQueue`).
5.  Implementar la lógica de "Tiempo Restante" para la cola de reclutamiento usando el ticker del `useGameRealtime` (si no existe, agregarlo).

✅ CRITERIOS DE ACEPTACIÓN
- La barra de recursos se actualiza segundo a segundo (interpolación client-side) y se sincroniza al finalizar construcciones.
- Al iniciar una construcción en Rooms, el estado cambia inmediatamente a "Construyendo" sin recargar.
- Al reclutar tropas, la cantidad de recursos baja y aparece la entrada en la cola de reclutamiento.
- Los ataques entrantes aparecen en el Overview sin refresh manual.
- No hay errores de hidratación (Server data coincide con Client initial data).

🛡️ REGLAS DE ORO
Runtime: Bun.
Framework: Next.js 15+ (Server Actions).
State: `useGameState` es la única fuente de verdad en el cliente.
DB: Validar nombres de columnas en `scripts/contexto/tablas.json` antes de escribir queries o filtros.
