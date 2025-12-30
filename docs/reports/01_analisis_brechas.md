# Reporte de Auditoría y Análisis de Brechas

Fecha: 2025-05-23
Autor: Jules (AI Architect)

## 1. Inventario de Base de Datos (Supabase)

### Tablas
- `usuario`: Datos principales del usuario.
- `historial_acceso`: Logs de acceso.
- `puntuacion_usuario`: Puntuaciones.
- `errores_configuracion`: Logs de errores.
- `configuracion_habitacion`: Meta-data de habitaciones.
- `configuracion_entrenamiento`: Meta-data de entrenamientos.
- `configuracion_tropa`: Meta-data de tropas.
- `requisito_habitacion`: Requisitos de construcción.
- `requisito_entrenamiento`: Requisitos de investigación.
- `tropa_bonus_contrincante`: Factores de combate.
- `propiedad`: Estado principal del juego (recursos, coordenadas).
- `habitacion_usuario`: Habitaciones construidas.
- `tropa_propiedad`: Tropas en propiedad (defensa/ataque disponible).
- `tropa_seguridad_propiedad`: Tropas asignadas a seguridad.
- `entrenamiento_usuario`: Investigaciones completadas.
- `cola_construccion`: Procesos de construcción activos.
- `cola_investigacion`: Procesos de investigación activos.
- `cola_reclutamiento`: Procesos de reclutamiento activos.
- `familia`: Clanes/Alianzas.
- `miembro_familia`: Relación usuario-familia.
- `invitacion_familia`: Invitaciones pendientes.
- `anuncio_familia`: Muro de la familia.
- `cola_misiones`: Movimientos de flota.
- `cola_eventos_flota`: Eventos asíncronos de flota.
- `informe_batalla`: Reportes de combate.
- `informe_espionaje`: Reportes de espionaje.
- `mensaje`: Sistema de correo interno.
- `ataque_entrante`: Alertas de ataques.

### RPCs Existentes
1.  `materializar_recursos(p_propiedad_id uuid)`: Calcula producción y actualiza stocks.
2.  `iniciar_construccion_habitacion(p_propiedad_id uuid, p_habitacion_id text)`: Valida recursos/colas e inicia construcción.
3.  `procesar_colas()`: Finaliza construcciones, investigaciones y reclutamientos vencidos.
4.  `iniciar_entrenamiento(p_propiedad_id uuid, p_entrenamiento_id text)`: Valida recursos/colas e inicia investigación.
5.  `iniciar_reclutamiento(p_propiedad_id uuid, p_tropa_id text, p_cantidad integer)`: Valida recursos/colas e inicia reclutamiento.
6.  `handle_new_user()`: Trigger para crear usuario tras registro en Auth.
7.  `crear_propiedad_inicial(p_nombre text, p_ciudad integer, p_barrio integer, p_edificio integer)`: Onboarding inicial.

## 2. Análisis del Frontend (TypeScript)

### `src/lib/services/game.service.ts`
- `createInitialProperty`: Usa RPC `crear_propiedad_inicial`. ✅
- `syncResources`: Usa RPC `materializar_recursos`. ✅
- `startConstruction`: Usa RPC `iniciar_construccion_habitacion`. ✅
- `getConstructionQueue`: Consulta directa (`select`) a `cola_construccion`. ⚠️ (Lectura aceptable, pero idealmente encapsulada si hay lógica de visibilidad compleja, aunque RLS lo cubre).

### `src/lib/services/auth.service.ts`
- `signUp`: Wrapper de `supabase.auth.signUp`. ✅
- `signIn`: Wrapper de `supabase.auth.signInWithPassword`. ✅

### `src/actions/game.actions.ts`
- `completeOnboardingAction`: Valida con Zod, llama a `createInitialProperty`. ✅
- `upgradeBuildingAction`: Valida con Zod, obtiene usuario, obtiene propiedad, llama a `startConstruction`. ✅
- `refreshGameStateAction`: Obtiene usuario y propiedad, llama a `syncResources`. ✅

## 3. Matriz de Brechas y Hallazgos

| Funcionalidad | Estado Actual (Frontend) | Estado Actual (DB) | Acción Recomendada |
| :--- | :--- | :--- | :--- |
| **Creación Usuario** | Auth Service | Trigger `handle_new_user` | ✅ Alineado. |
| **Onboarding (Propiedad)** | `createInitialProperty` | RPC `crear_propiedad_inicial` | ✅ Alineado. |
| **Recursos** | `syncResources` | RPC `materializar_recursos` | ✅ Alineado. |
| **Construcción** | `startConstruction` | RPC `iniciar_construccion_habitacion` | ✅ Alineado. |
| **Cola Construcción** | `getConstructionQueue` (Select directo) | Tabla `cola_construccion` + RLS | ⚠️ Mantener lectura directa si solo es visualización. |
| **Entrenamiento** | No implementado en actions/service explícitamente (solo DB) | RPC `iniciar_entrenamiento` | ⚠️ Falta exponer en Service/Action. |
| **Reclutamiento** | No implementado en actions/service explícitamente (solo DB) | RPC `iniciar_reclutamiento` | ⚠️ Falta exponer en Service/Action. |
| **Procesamiento Colas** | No hay cron/trigger visible llamado desde el cliente | RPC `procesar_colas` | ⚠️ Debe ser llamado periódicamente. O bien via pg_cron (si disponible) o via Edge Function/Cron. El cliente podría llamar a "refresh" que a su vez llama a `materializar`? No, `procesar_colas` no se llama en `materializar_recursos`. |
| **Ataque / Misiones** | No detectado en TS | RPCs faltantes? Tablas existen (`cola_misiones`), pero no hay lógica de movimiento/combate visible en RPCs leídos (solo tablas). | 🚨 **BRECHA CRÍTICA**: Falta lógica de movimiento y combate en DB. Solo existen tablas. |

### Hallazgos Adicionales
1.  **Lógica de Combate**: Existen tablas `informe_batalla`, `cola_misiones`, pero no veo un RPC que "resuelva" la batalla o mueva las flotas. Probablemente se necesite un `procesar_misiones` o similar.
2.  **`procesar_colas`**: Esta función finaliza las colas, pero nadie la llama. Debería ser llamada o bien por un cron job o, en un entorno serverless "puro" sin cron, quizás perezosamente al leer el estado del usuario (aunque es arriesgado para interacciones PvP).
3.  **Services Incompletos**: Faltan servicios para Entrenamientos y Reclutamiento, aunque los RPCs existen.

## 4. Plan de Acción (Revisado)

1.  **Exponer RPCs existentes en Servicios**:
    - Crear `startResearch` y `recruitTroops` en `game.service.ts`.
    - Crear Actions correspondientes.

2.  **Abordar "Procesamiento de Colas"**:
    - Si bien `materializar_recursos` se llama "lazy", la finalización de construcciones (`procesar_colas`) no parece estar enganchada.
    - **Propuesta**: Crear un RPC wrapper `sincronizar_estado_usuario(p_propiedad_id)` que llame internamente a `materializar_recursos` Y `procesar_colas` (al menos para lo que afecte al usuario).
    - *Nota*: `procesar_colas` itera sobre TODA la tabla. Esto es peligroso para llamarlo desde un usuario. Debería filtrarse por usuario/propiedad si se va a llamar on-demand, o dejarse para un cron de sistema.
    - *Refactor DB*: Modificar `procesar_colas` para aceptar `p_propiedad_id` opcional y procesar solo eso si se provee.

3.  **Lógica de Misiones (Básico)**:
    - El alcance de esta tarea es "Auditoría y Sincronización". Implementar todo el sistema de combate puede exceder el scope si no estaba ya.
    - Me centraré en conectar lo que ya existe y asegurar que lo que está en TS (Gestión) use la DB.
    - Como no hay lógica de combate en TS para migrar, no hay "deuda" que mover, sino "funcionalidad faltante". Me limitaré a asegurar que la arquitectura soporte esto.

4.  **Refactorización Propuesta para Fase 2 (DB Layer)**:
    - Modificar `procesar_colas` para que sea seguro llamarlo por usuario (Scope: Propiedad/Usuario).
    - Crear RPC `lanzar_mision` (placeholder o básico) si se requiere gestión de misiones desde el frontend, para evitar inserts directos.
