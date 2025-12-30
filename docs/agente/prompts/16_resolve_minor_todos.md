🏗️ ESPECIFICACIÓN TÉCNICA: Resolución de TODOs Menores (Tropas e Investigación)
Rol Asignado: Backend/Frontend Developer
Contexto: La auditoría detectó que los componentes de "Tropas" y "Entrenamiento" muestran placeholders ("-", "Sin unidad") porque el RPC principal `get_dashboard_data` no retorna el inventario de tropas ni el nivel de investigaciones completadas. Es necesario enriquecer el modelo de datos del dashboard.

🧠 Análisis de Contexto (Automático):
- **RPC:** `get_dashboard_data` (en `20250524000000_dashboard_rpc.sql`).
- **Tablas:** `tropa_propiedad` (inventario), `entrenamiento_usuario` (niveles).
- **Componentes:** `troops.tsx`, `training.tsx`, `overview-content.tsx`.

📦 ARCHIVOS A INTERVENIR
1.  `supabase/migrations/20250531000000_enrich_dashboard_rpc.sql` (Crear)
2.  `src/types/game.ts` (Actualizar interfaces)
3.  `src/components/dashboard/troops.tsx` (Conectar)
4.  `src/components/dashboard/training.tsx` (Conectar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Extender `get_dashboard_data`.
Detalle:
- Añadir consulta a `tropa_propiedad` -> `v_tropas json`.
- Añadir consulta a `entrenamiento_usuario` -> `v_investigaciones json`.
- Incluir estos JSONs en el objeto de retorno (`RETURN json_build_object(..., 'tropas', v_tropas, 'investigaciones', v_investigaciones)`).

[Fase 2: TypeScript Types]
Acción: Actualizar `DashboardData`.
Detalle: Añadir campos `tropas: Tropa[]` e `investigaciones: Investigacion[]` a la interfaz.

[Fase 3: UI Layer]
Acción: Conectar componentes.
Detalle:
- **`troops.tsx`**: Mapear `gameState.tropas` en lugar de texto estático.
- **`training.tsx`**: Mostrar colas de entrenamiento reales (ya están en `gameState.colas.investigacion`) O el nivel actual de investigaciones (`gameState.investigaciones`). *El audit report se refería a un placeholder "-", revisar si es cola o estado.*
- **`overview-content.tsx`**: Actualizar `const researchLevel` sumando los niveles de `gameState.investigaciones`.

✅ CRITERIOS DE ACEPTACIÓN
- El dashboard debe mostrar la lista real de tropas estacionadas en la propiedad.
- El widget de visión general debe reflejar el nivel acumulado de investigación real.
- Los placeholders "-" y "Sin unidad" deben desaparecer.

🛡️ REGLAS DE ORO
Eficiencia: Usar `json_agg` en la base de datos para evitar N+1 queries.
