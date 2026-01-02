🏗️ ESPECIFICACIÓN TÉCNICA: Lógica Avanzada de Mapa Interactiva
Rol Asignado: Senior Frontend Engineer / UX Specialist
Contexto: La página de mapa (`/dashboard/map`) actualmente renderiza una grilla básica. Se requiere mejorar la experiencia de usuario (UX) implementando navegación fluida entre barrios/ciudades, visualización detallada de solares mediante Dialogs/Tooltips interactivos, y lógica de cálculo de distancias/tiempos para misiones directamente desde la interfaz del mapa.

🧠 Análisis de Contexto (Automático):
- Componentes Existentes: `MapPage` (Server), `CityMap` (Client, básico), `MapControls` (Client).
- Datos: `getMapTiles` RPC (retorna propiedades en un barrio).
- Requerimientos: Grilla 15x15 (225 slots), Tooltips con info detallada, Dialog al hacer click (para enviar misión), Navegación URL-based.

📦 ARCHIVOS A INTERVENIR
src/app/dashboard/map/page.tsx (Modificar: Asegurar paso de user property para cálculos de origen).
src/components/dashboard/map/city-map.tsx (Refactorizar: Agregar interactividad click y lógica de tiles).
src/components/dashboard/map/map-controls.tsx (Mejorar: Navegación robusta con validación de rangos).
src/components/dashboard/map/tile-details-dialog.tsx (Crear: Modal de acciones).
src/lib/utils/map-utils.ts (Crear: Fórmulas de distancia y tiempo).

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Utilidades de Cálculo]
Acción: Crear `src/lib/utils/map-utils.ts`.
Detalle:
- Implementar función `calculateDistance(origin: Coords, target: Coords): number`.
    - Fórmula: Distancia euclidiana o Manhattan según reglas del juego (revisar legacy si existe, o usar estándar `sqrt((x2-x1)^2 + (y2-y1)^2)`). Considerar que la distancia entre barrios/ciudades añade un factor de escala (ej: 1 ciudad = 100 unidades, 1 barrio = 10 unidades).
- Implementar función `calculateTravelTime(distance: number, fleetSpeed: number): number`.
    - Retorna segundos.

[Fase 2: Componente de Detalles (Dialog)]
Acción: Crear `src/components/dashboard/map/tile-details-dialog.tsx`.
Detalle:
- Usar `Dialog` de shadcn/ui.
- Props: `tileData` (datos del solar), `originCoords` (coordenadas del usuario actual), `isOpen`, `onClose`.
- Contenido:
    - Información del propietario (Avatar, Nombre, Familia).
    - Coordenadas completas (C:B:E).
    - Distancia desde el usuario actual (usando `map-utils`).
    - Botones de Acción: "Espiar", "Atacar", "Transportar", "Ocupar" (si está vacío).
    - Al hacer click en acción, redirigir a `/dashboard/missions?type=xxx&target=C:B:E`.

[Fase 3: Mapa Interactivo (CityMap)]
Acción: Refactorizar `src/components/dashboard/map/city-map.tsx`.
Detalle:
- Recibir `userProperty` (origen) como prop adicional.
- Mantener la grilla 15x15.
- Al hacer **Hover**: Mostrar Tooltip resumen (ya existe, mejorar estilo).
- Al hacer **Click**:
    - Si es propio: Redirigir a `/dashboard/overview`.
    - Si es ajeno u ocupado: Abrir `TileDetailsDialog`.
    - Si es vacío: Abrir `TileDetailsDialog` con opción "Ocupar" o "Fundar".
- Optimización: Usar `useMemo` para la generación de tiles.

[Fase 4: Controles de Navegación]
Acción: Mejorar `src/components/dashboard/map/map-controls.tsx`.
Detalle:
- Inputs numéricos para Ciudad y Barrio.
- Botones de flecha para navegación rápida (Barrio +/- 1).
- Validación: Ciudad (1-X), Barrio (1-X).
- Usar `useRouter` y `useSearchParams` para actualizar la URL sin recarga completa (Server Components re-fetch automático).

✅ CRITERIOS DE ACEPTACIÓN
- Navegar a Ciudad 1, Barrio 2 actualiza la grilla correctamente.
- Click en una propiedad enemiga abre el Dialog con opciones de misión.
- El cálculo de distancia en el Dialog es correcto relativo a la propiedad del usuario.
- La grilla respeta el layout 15x15 y es responsive (scroll horizontal en móviles o ajuste de tamaño).

🛡️ REGLAS DE ORO
Runtime: Bun.
UI: Shadcn/ui + Lucide Icons.
Navegación: URL como fuente de verdad (`?city=1&district=2`).
Performance: Evitar re-renders innecesarios de los 225 tiles.
