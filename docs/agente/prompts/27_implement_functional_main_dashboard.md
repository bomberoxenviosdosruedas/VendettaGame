🏗️ ESPECIFICACIÓN TÉCNICA: Implementación Integral del Dashboard Principal (Overview)
Rol Asignado: Senior Frontend Engineer
Contexto: La página de resumen del dashboard (`/dashboard/overview`) debe ser el centro de comando del jugador. Actualmente, aunque existe un plan para "Realtime" (Prompt 19), se requiere una especificación detallada para integrar los nuevos componentes desarrollados en otras secciones (Colas, Misiones, Ataques) y hacer que esta vista sea totalmente funcional y reactiva, abandonando cualquier widget estático.

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: Todas las cubiertas por `getDashboardData`.
- Componentes Disponibles (Planificados/Existentes): 
  - `ConstructionQueueList` (Prompt 21).
  - `ActiveMissionsList` (Prompt 23 - Adaptar para resumen).
  - `IncomingAttacks` (Prompt 19/23).
  - `ResourceTicker` (Existente, revisar).
- Hook Principal: `useGameState` (Debe ser la única fuente de verdad).

📦 ARCHIVOS A INTERVENIR
src/app/dashboard/overview/page.tsx (Refactor: Data Fetching Inicial)
src/components/dashboard/overview/overview-view.tsx (Crear: Client Wrapper Principal)
src/components/dashboard/overview/resource-ticker.tsx (Mejorar: Animación fluida)
src/components/dashboard/overview/quick-actions.tsx (Crear: Accesos directos)
src/components/dashboard/overview/alerts-widget.tsx (Mejorar: Reactivo a `ataque_entrante`)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Server Side Fetching]
Acción: Actualizar `src/app/dashboard/overview/page.tsx`.
Detalle:
- Mantener la llamada a `getDashboardData` (RPC) para obtener el snapshot inicial.
- No hacer llamadas paralelas innecesarias si `getDashboardData` ya trae todo (revisar Prompt 25, que enriquece el RPC). Si el RPC ya trae `colas`, `tropas`, `ataques`, usar eso.
- Pasar el objeto `initialData` completo al componente cliente.

[Fase 2: Client View Wrapper]
Acción: Crear `src/components/dashboard/overview/overview-view.tsx`.
Detalle:
- Inicializar `useGameState(initialData)`.
- Layout Grid (Responsive):
  - **Header:** `ResourceTicker` (Barra superior o tarjetas destacadas).
  - **Columna Izq:** `QuickActions` (Atacar, Espiar, Mapa) y `ConstructionQueueList` (Modo resumen: max 3 items).
  - **Columna Der:** `AlertsWidget` (Ataques entrantes) y `ActiveMissionsList` (Modo resumen: max 5 items).
  - **Centro/Fondo:** Resumen de tropas o estado general (Nivel de edificio principal).

[Fase 3: Componentes de Resumen]
Acción: Refactorizar/Crear Widgets para Overview.
Detalle:
- **`ResourceTicker`**: Asegurar que use `requestAnimationFrame` o un `interval` rápido para interpolar los recursos visualmente basándose en `prod/s` del `gameState`.
- **`AlertsWidget`**: Conectar a `gameState.incoming_attacks`. Si `length > 0`, mostrar alerta roja parpadeante y cuenta regresiva al ataque más próximo.
- **`QuickActions`**: Botones que navegan a `/dashboard/map` o abren modales de reclutamiento rápido (opcional).

[Fase 4: Integración de Colas]
Acción: Importar y adaptar listas.
Detalle:
- Importar `ConstructionQueueList` (de rooms). Pasar prop `limit={3}` (implementar esta prop si no existe) para no saturar el overview.
- Importar `ActiveMissionsList` (de missions). Pasar prop `compact={true}` para mostrar versión simplificada.

✅ CRITERIOS DE ACEPTACIÓN
- El dashboard carga instantáneamente con datos SSR (Hydration).
- Los recursos suben visualmente en tiempo real.
- Si se completa una construcción (evento realtime), desaparece de la lista y se actualizan los recursos/niveles sin F5.
- Si llega un ataque, el widget de alertas se activa automáticamente.

🛡️ REGLAS DE ORO
Runtime: Bun.
Estilo: Shadcn UI (Dashboard layout).
Performance: Evitar re-renders de todo el dashboard si solo cambia un recurso; usar componentes memoizados donde sea posible.
Dependencias: Reutilizar componentes de `rooms` y `missions` para consistencia visual.
