🏗️ ESPECIFICACIÓN TÉCNICA: Módulo de Reclutamiento (Frontend & Realtime)
Rol Asignado: Frontend Realtime Specialist
Contexto: Se requiere implementar la funcionalidad completa de la página de Reclutamiento (`/dashboard/recruitment`). Actualmente, la página usa datos estáticos (`recruitmentData`, `recruitmentQueue`). El objetivo es reemplazar esto con datos en tiempo real provenientes de la base de datos (`useGameState`), implementar la lógica de cálculo de costos y tiempos, y permitir al usuario reclutar tropas mediante acciones del servidor que invoquen a los RPCs correspondientes.

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `configuracion_tropa` (Estático), `tropa_propiedad` (Inventario), `cola_reclutamiento` (Cola activa), `propiedad` (Recursos).
- RPCs Disponibles: `iniciar_reclutamiento_atomico` (o `iniciar_reclutamiento`), `cancelar_reclutamiento` (si existe, o crear).
- Hooks: `useGameState` (Debe proveer `tropas`, `colas.reclutamiento`, `recursos`).
- Componentes Existentes: `TroopCard` (Necesita refactor para aceptar datos dinámicos).

📦 ARCHIVOS A INTERVENIR
src/app/dashboard/recruitment/page.tsx (Refactor: Wrapper Client)
src/components/dashboard/recruitment/recruitment-view.tsx (Crear: Container Principal)
src/components/dashboard/recruitment/troop-card.tsx (Refactor: Interactividad)
src/components/dashboard/recruitment/recruitment-queue-list.tsx (Crear: Lista de cola)
src/lib/actions/recruitment.actions.ts (Crear: Server Actions)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Server Actions]
Acción: Crear `src/lib/actions/recruitment.actions.ts`.
Detalle:
- Implementar `recruitTroopAction(propertyId: string, troopId: string, quantity: number)`.
- Validar sesión.
- Validar input (cantidad > 0).
- Llamar RPC `iniciar_reclutamiento_atomico` (o `iniciar_reclutamiento`).
- Manejar errores y revalidar.

[Fase 2: Vista Principal (RecruitmentView)]
Acción: Crear `src/components/dashboard/recruitment/recruitment-view.tsx`.
Detalle:
- Client Component.
- Props: `staticTroops` (ConfiguracionTropa[] - fetched server side o passed as prop).
- State: Acceder a `useGameState` para obtener recursos, inventario actual y cola.
- Renderizar:
  1. `<RecruitmentQueueList queue={gameState.colas.reclutamiento} />`.
  2. Grid de `<TroopCard />` mapeando `staticTroops`.
  3. Pasar a cada carta: `inventoryCount` (de `tropa_propiedad`), `maxRecruitable` (calculado con recursos).

[Fase 3: Componente de Cola]
Acción: Crear `src/components/dashboard/recruitment/recruitment-queue-list.tsx`.
Detalle:
- Mostrar lista de reclutamientos en curso.
- Usar `Countdown` para el tiempo restante.
- Botón de cancelar (si la lógica de negocio lo permite).

[Fase 4: Tarjeta de Tropa (TroopCard)]
Acción: Refactorizar `src/components/dashboard/recruitment/troop-card.tsx`.
Detalle:
- Input numérico o Slider para seleccionar cantidad.
- Botón "Reclutar":
  - Texto dinámico: "Reclutar X (Costo: ...)".
  - Deshabilitado si: Recursos insuficientes, Cantidad 0.
- Mostrar stats de la tropa (Ataque, Defensa, Velocidad, Carga).
- Feedback visual al reclutar (loading state).

[Fase 5: Integración en Page]
Acción: Modificar `src/app/dashboard/recruitment/page.tsx`.
Detalle:
- Fetch de `configuracion_tropa` (Server Side) para tener los metadatos base.
- Renderizar `<RecruitmentView initialTroops={troops} />`.

✅ CRITERIOS DE ACEPTACIÓN
- La cantidad máxima reclutable se calcula correctamente en base a los recursos actuales (armas, munición, dólares).
- Al reclutar, los recursos bajan visualmente (si `useGameState` maneja optimismo o updates rápidos).
- La cola de reclutamiento aparece inmediatamente tras la acción.
- Se muestran las cantidades actuales de tropas que posee el usuario.

🛡️ REGLAS DE ORO
Runtime: Bun.
Naming: Snake_case para DB, CamelCase para TS.
Tablas: `tropa_propiedad`, `cola_reclutamiento`.
Lógica: Validación final siempre en RPC.
