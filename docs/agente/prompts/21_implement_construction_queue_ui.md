🏗️ ESPECIFICACIÓN TÉCNICA: UI de Cola de Construcción con Límites
Rol Asignado: Frontend UI Specialist
Contexto: La página de gestión de habitaciones (`/dashboard/rooms`) permite iniciar construcciones, pero carece de visibilidad sobre la cola de construcción actual y no bloquea visualmente la acción cuando se alcanza el límite de 5 construcciones (regla de negocio y base de datos). Se requiere crear un componente visual para la cola y desactivar el botón "Ampliar" cuando corresponda.

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `cola_construccion` (Lectura).
- Componentes Existentes: `RoomCard`, `RoomsPage` (o `RoomsView` si se aplica refactor de prompt 19).
- Datos: `gameState.colas.construccion` (disponible vía `useGameState`).
- Regla: Límite máximo de 5 construcciones activas por propiedad.

📦 ARCHIVOS A INTERVENIR
src/lib/constants.ts (Crear/Modificar)
src/components/dashboard/rooms/construction-queue-list.tsx (Crear)
src/app/dashboard/rooms/page.tsx (Modificar - Refactor a Client Wrapper)
src/components/dashboard/rooms/rooms-view.tsx (Crear - Client Component)
src/components/dashboard/rooms/room-card.tsx (Modificar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Configuración Global]
Acción: Definir constante.
Detalle:
- En `src/lib/constants.ts` (crear si no existe), exportar `export const MAX_CONSTRUCTION_QUEUE_SIZE = 5;`.

[Fase 2: Componente de Cola (Queue List)]
Acción: Crear `src/components/dashboard/rooms/construction-queue-list.tsx`.
Detalle:
- Debe ser un Client Component.
- Props: Recibe `queue` (`ColaDetalle[]` de `types/game.ts`).
- Renderizado:
  - Si la cola está vacía, retornar `null` o un mensaje discreto.
  - Si tiene items, mostrar una lista o tarjetas compactas horizontalmente/verticalmente.
  - Cada item debe mostrar: `nombre` (edificio), `nivel_destino`, y `fecha_fin` (countdown si es posible, o timestamp).
  - Usar componentes de `src/components/ui/` (Card, Badge, Progress).

[Fase 3: Vista de Habitaciones (RoomsView)]
Acción: Crear `src/components/dashboard/rooms/rooms-view.tsx`.
Detalle:
- Este será el componente principal renderizado por `page.tsx`.
- Usar `useGameState` para obtener `colas.construccion` y `edificios`.
- Calcular `queueLength = gameState.colas.construccion.length`.
- Renderizar:
  1. `<ConstructionQueueList queue={gameState.colas.construccion} />` en la parte superior.
  2. Grid de `<RoomCard />` iterando sobre los datos estáticos (`roomsData`) fusionados con `gameState.edificios` (niveles reales).
  3. Pasar prop `isQueueFull={queueLength >= MAX_CONSTRUCTION_QUEUE_SIZE}` a cada `RoomCard`.

[Fase 4: Adaptar RoomCard]
Acción: Actualizar `src/components/dashboard/rooms/room-card.tsx`.
Detalle:
- Agregar prop `isQueueFull: boolean` (opcional, default false).
- En el botón "Ampliar":
  - Agregar condición `disabled={isLoading || !propiedadId || isQueueFull}`.
  - Si `isQueueFull` es true, mostrar un Tooltip o cambiar el texto a "Cola Llena" (opcional, pero recomendado para UX).

[Fase 5: Refactor Page]
Acción: Modificar `src/app/dashboard/rooms/page.tsx`.
Detalle:
- Importar `RoomsView`.
- Obtener datos iniciales (Server Side) si se desea hidratar (opcional según Prompt 19, pero buena práctica).
- Renderizar `<RoomsView />` (que internamente usará `useGameState` para realtime).

✅ CRITERIOS DE ACEPTACIÓN
- Al entrar a `/dashboard/rooms`, si hay construcciones, se ven listadas arriba.
- Si hay 5 construcciones, todos los botones "Ampliar" aparecen deshabilitados.
- Al cancelar una construcción (si se implementa) o terminar una, los botones se habilitan automáticamente (gracias a `useGameState`).

🛡️ REGLAS DE ORO
Runtime: Bun.
State: `useGameState` es la fuente de verdad.
UX: Feedback visual claro cuando la cola está llena.
Consistencia: Usar `MAX_CONSTRUCTION_QUEUE_SIZE` en frontend y backend (si aplica validación Zod).
