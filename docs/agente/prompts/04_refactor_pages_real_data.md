🏗️ ESPECIFICACIÓN TÉCNICA: Refactorización de UI para Datos Reales
Rol Asignado: Frontend Tech Lead / Full Stack Developer
Contexto: El dashboard del proyecto tiene múltiples páginas (`buildings`, `resources`, `tech-tree`, `recruitment`, `training`) que actualmente podrían estar utilizando datos estáticos ("mock data") o una mezcla de datos reales e incompletos. El objetivo es auditar y refactorizar estas vistas para que dependan EXCLUSIVAMENTE de la base de datos Supabase, a través del contexto global `GameStateProvider` (que se hidrata con la RPC `get_dashboard_data`).

🧠 Análisis de Contexto (Automático):
- **Fuente de Verdad:** `useGameState()` (Contexto Cliente) -> `get_dashboard_data()` (RPC Server).
- **Estructura Actual RPC:** Retorna `propiedad`, `recursos`, `edificios` (lista), `colas`, `puntos`.
- **Posible Déficit:** La RPC actual `get_dashboard_data` podría NO estar devolviendo detalles específicos necesarios para algunas vistas (ej: lista completa de tecnologías investigadas para el árbol tecnológico, detalles de tropas estacionadas para la vista de reclutamiento, etc.).

📦 ARCHIVOS A INTERVENIR
1.  **RPC Update:** `supabase/migrations/20250526000000_update_dashboard_rpc_extended.sql` (Si se detectan datos faltantes).
2.  **UI Components:**
    - `src/components/dashboard/buildings/building-list.tsx` (o similar)
    - `src/components/dashboard/tech-tree/tech-tree-view.tsx` (o similar)
    - `src/components/dashboard/recruitment/recruitment-panel.tsx` (o similar)
    - `src/components/dashboard/training/training-panel.tsx` (o similar)
    - `src/components/dashboard/resources/resource-view.tsx` (o similar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Auditoría de Datos Faltantes]
Acción: Revisar componentes de UI vs Schema de RPC.
Detalle:
- Identificar qué datos muestra la UI actualmente (hardcoded) que NO vienen en `get_dashboard_data`.
- Ejemplo probable: La RPC devuelve `edificios` presentes, pero para construir la UI a veces necesitamos *todos* los edificios configurables (incluso los no construidos) para mostrar opciones de "Construir".
- Solución:
  - O bien la RPC devuelve también la configuración (metadata).
  - O (Preferible) la metadata estática (`configuracion_habitacion`, `configuracion_tropa`, etc.) se carga separadamente o se cachea, y la RPC solo trae el estado dinámico (niveles, cantidades). *Decisión: La RPC ya hace JOIN con configuración para nombres. Asegurarse de que traiga TODO lo necesario para pintar la UI.*

[Fase 2: DB Layer - Ampliación de RPC (Si es necesario)]
Acción: Crear migración `supabase/migrations/20250526000000_update_dashboard_rpc_extended.sql`.
Detalle:
- Modificar `get_dashboard_data` para incluir:
  - Lista de entrenamientos/investigaciones completados (`entrenamiento_usuario`).
  - Lista de tropas en propiedad (`tropa_propiedad` y `tropa_seguridad_propiedad`).
  - (Opcional) Metadata básica si no se carga por otro lado.

[Fase 3: Service Layer - Types]
Acción: Actualizar interfaces TypeScript.
Detalle:
- Actualizar el tipo de retorno de `getDashboardData` en `src/lib/supabase/actions.ts` (o donde esté definido) para reflejar los nuevos campos del JSON.
- Actualizar la interfaz del Contexto `GameState`.

[Fase 4: UI Layer - Refactorización de Componentes]
Acción: Conectar componentes a `useGameState`.
Detalle:
- Para cada página (`/dashboard/*`):
  1.  Eliminar constantes `const MOCK_DATA = ...`.
  2.  Importar `useGameState`.
  3.  Mapear los datos del contexto a la vista.
  4.  Manejar estados de carga (`if (!gameState) return <Skeleton />`).
  5.  Si hay listas (ej: edificios), cruzar los datos del usuario (`habitacion_usuario`) con la configuración base para mostrar elementos no construidos con nivel 0, si es el comportamiento deseado.

✅ CRITERIOS DE ACEPTACIÓN
- Ningún componente dentro de `/dashboard` debe contener arrays de datos estáticos (excepto configuraciones puras de UI como etiquetas o iconos).
- Los niveles de edificios, recursos y colas deben reflejar el estado real de la DB.
- Si modifico la DB manualemnte, la UI debe reflejarlo al recargar (o por tiempo real si ya está implementado).

🛡️ REGLAS DE ORO
Runtime: Bun.
DB: Supabase RPC.
State: `useGameState` es la única fuente de verdad para datos dinámicos en cliente.
Performance: Evitar múltiples llamadas fetch en cliente; usar el dato hidratado por el Provider.
