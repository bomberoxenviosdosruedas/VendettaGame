🏗️ ESPECIFICACIÓN TÉCNICA: Módulo de Reconocimiento (Investigaciones/Tech Tree)
Rol Asignado: Game Mechanics Specialist
Contexto: Se requiere implementar la sección de "Reconocimiento" (referida internamente como Tech Tree o Investigaciones). Este módulo permite al usuario desbloquear y mejorar tecnologías que benefician a todas sus propiedades. Funciona mediante un sistema de árbol de requisitos y consume recursos globales o locales (dependiendo del diseño, usualmente locales a la propiedad donde se investiga, pero el efecto es global para el usuario o propiedad).

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `configuracion_entrenamiento` (Datos estáticos), `entrenamiento_usuario` (Estado del usuario), `cola_investigacion` (Cola de procesos), `requisito_entrenamiento` (Dependencias).
- RPCs Disponibles: `iniciar_entrenamiento` (Confirmar existencia o crear si falta), `get_tech_tree_data` (Sugerido).
- Componentes Existentes: `src/app/dashboard/tech-tree/` (Ruta probable).
- Referencia Legada: `src/app/(dashboard)/training/` o similar en proyecto anterior. El término "entrenamiento" se usa a veces indistintamente con "investigación" en el código legado (`EntrenamientoUsuario`), pero funcionalmente son tecnologías.

📦 ARCHIVOS A INTERVENIR
src/app/dashboard/tech-tree/page.tsx (Crear: Wrapper)
src/components/dashboard/tech-tree/tech-tree-view.tsx (Crear: UI Principal)
src/components/dashboard/tech-tree/tech-card.tsx (Crear: Tarjeta de tecnología)
src/lib/actions/research.actions.ts (Crear: Server Actions)
src/lib/constants.ts (Agregar constantes si faltan)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Server Actions & Data]
Acción: Crear `src/lib/actions/research.actions.ts`.
Detalle:
- Implementar `startResearchAction(trainingId: string, propertyId: string)`.
- Validar que no haya una investigación en curso (`cola_investigacion` por propiedad o usuario).
- Validar recursos y requisitos (usar RPC `iniciar_entrenamiento` que ya contiene la lógica de validación y descuento de recursos).
- `revalidatePath`.

[Fase 2: Tech Tree UI (Vista Principal)]
Acción: Crear `src/components/dashboard/tech-tree/tech-tree-view.tsx`.
Detalle:
- Client Component.
- Props: `trainings` (Lista de configs fusionada con el nivel actual del usuario `entrenamiento_usuario`).
- Layout: Grid de tarjetas.
- Mostrar estado de la cola de investigación actual (si hay alguna activa).
- Agrupación opcional por categorías si la tabla `configuracion_entrenamiento` tiene algún campo de tipo, si no, lista plana ordenada.

[Fase 3: Tech Card (Componente Individual)]
Acción: Crear `src/components/dashboard/tech-tree/tech-card.tsx`.
Detalle:
- Mostrar: Imagen, Nombre, Nivel Actual -> Nivel Siguiente.
- Costos y Tiempo: Calcular en base al nivel siguiente (fórmulas lineales o exponenciales según `src/data/room_scaling_rules_updated.json` o similar si existe para entrenamientos).
- Botón "Investigar":
  - Deshabilitado si: Recursos insuficientes, Requisitos no cumplidos, Cola ocupada.
  - Al hacer click, invocar `startResearchAction`.
- Tooltip/Dialog de Requisitos: Mostrar qué otros entrenamientos/edificios se necesitan.

[Fase 4: Integración en Page]
Acción: Crear `src/app/dashboard/tech-tree/page.tsx`.
Detalle:
- Fetch de `getDashboardData` (o fetch específico de configs y estado de entrenamientos).
- Pasar datos a `TechTreeView`.

✅ CRITERIOS DE ACEPTACIÓN
- Visualización clara del nivel actual de cada tecnología.
- Bloqueo de acciones si no se cumplen requisitos (mostrar en rojo qué falta).
- Feedback visual inmediato al iniciar investigación (Optimistic UI o Toast).
- La cola de investigación se muestra en la parte superior o en el componente de colas global.

🛡️ REGLAS DE ORO
Runtime: Bun.
Naming: Usar `tech-tree` o `investigation` para la UI, pero mapear a tablas `entrenamiento_...` en BD (Legacy naming convention).
Tablas: `cola_investigacion`, `entrenamiento_usuario`, `configuracion_entrenamiento`.
