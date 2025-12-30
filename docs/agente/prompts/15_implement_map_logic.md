🏗️ ESPECIFICACIÓN TÉCNICA: Implementación Real del Mapa
Rol Asignado: Full Stack Developer
Contexto: El mapa del juego (`src/app/dashboard/map`) utiliza actualmente un generador de datos falsos (`map-data.ts`). Se requiere implementar la capa de persistencia y visualización real, permitiendo ver las propiedades de otros jugadores en una cuadrícula.

🧠 Análisis de Contexto (Automático):
- **Tabla:** `public.propiedad` (tiene `coordenada_ciudad`, `coordenada_barrio`, `coordenada_edificio`).
- **Vista Actual:** `CityMap` renderiza una cuadrícula.
- **Necesidad:** RPC para obtener datos espaciales.

📦 ARCHIVOS A INTERVENIR
1.  `supabase/migrations/20250530000000_map_rpc.sql` (Crear)
2.  `src/lib/services/game.service.ts` (Añadir fetch)
3.  `src/app/dashboard/map/page.tsx` (Conectar)
4.  `src/components/dashboard/map/city-map.tsx` (Adaptar props)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - RPC]
Acción: Crear función `get_map_tiles`.
Detalle:
- Parámetros: `p_ciudad`, `p_barrio` (Para ver un barrio específico).
- Retorno: JSON con lista de propiedades en ese barrio (coordenadas x/y que corresponden a edificio, nombre usuario, nivel, clan).
- Lógica: `SELECT * FROM propiedad WHERE coordenada_ciudad = p_ciudad AND coordenada_barrio = p_barrio`.

[Fase 2: Service Layer]
Acción: Método `getMapData(city, district)`.
Detalle: Llamar al RPC y tipar la respuesta.

[Fase 3: UI Layer]
Acción: Refactorizar `map/page.tsx`.
Detalle:
- Obtener coordenadas actuales del usuario (de `gameState` o params de URL).
- Fetch data del servidor (o cliente con SWR/React Query si se permite navegación). *Sugerencia: Server Component inicial + Client Navigation.*
- Eliminar import de `mapData`.

[Fase 4: Componente Map]
Acción: Actualizar `city-map.tsx`.
Detalle:
- Recibir array de `TileData` reales.
- Mapear las propiedades del array a la grilla visual (0-255 edificios? o cuadrícula X/Y?). *Nota: El sistema de coordenadas actual es Ciudad/Barrio/Edificio. El mapa debe representar el "Barrio" mostrando los "Edificios".*
- Mostrar badges (niveles, dueños) solo si el tile tiene datos reales.

✅ CRITERIOS DE ACEPTACIÓN
- El mapa debe mostrar las propiedades reales almacenadas en la DB.
- Los espacios vacíos deben ser interactuables (opción "Colonizar" futura) o simplemente vacíos.
- No deben existir referencias a `src/lib/data/map-data.ts`.

🛡️ REGLAS DE ORO
Performance: El RPC debe ser ligero (solo datos esenciales para el mapa: ID, coordenadas, nombre, avatar).
