# Auditoría Completa del Esquema de Base de Datos (Supabase/PostgreSQL)

**Fecha:** 14 de Junio de 2025
**Fuente:** Migraciones SQL (`20250210_consolidated`, `20250601_secure_rpc`).
**Estado:** Producción.

---

## 1. Tablas de Núcleo (Core Tables)

### `public.usuario`
Almacena el perfil público del jugador, vinculado a la autenticación de Supabase.
| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, FK(`auth.users`), ON DELETE CASCADE | ID único del usuario. |
| `nombre_usuario` | `text` | NOT NULL, UNIQUE | Nickname público. |
| `email` | `text` | NOT NULL, UNIQUE | Email de contacto. |
| `url_avatar` | `text` | NULL | URL de imagen de perfil. |
| `nombre` | `text` | DEFAULT '' | Nombre real (opcional). |
| `titulo` | `text` | NULL | Título honorífico. |
| `rol` | `text` | DEFAULT 'USER' | Rol del sistema. |
| `primer_login` | `boolean` | DEFAULT `false` | Flag para tutorial/onboarding. |
| `ultimo_visto` | `timestamptz` | DEFAULT `now()` | Última actividad. |
| `fecha_creacion` | `timestamptz` | DEFAULT `now()` | Registro. |
| `fecha_actualizacion` | `timestamptz` | DEFAULT `now()` | Último update. |

### `public.propiedad`
Representa una ciudad o base de un jugador. Es el nodo central de la economía.
| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID de la propiedad. |
| `usuario_id` | `uuid` | FK(`public.usuario`), ON DELETE CASCADE | Dueño. |
| `nombre` | `text` | NOT NULL | Nombre de la ciudad. |
| `coordenada_ciudad` | `integer` | NOT NULL | Eje X Macro (1-100). |
| `coordenada_barrio` | `integer` | NOT NULL | Eje Y Macro (1-25). |
| `coordenada_edificio` | `integer` | NOT NULL | Eje Z Micro (1-25). |
| `armas` | `bigint` | DEFAULT 0, CHECK `>= 0` | Recurso primario. |
| `municion` | `bigint` | DEFAULT 0, CHECK `>= 0` | Recurso secundario. |
| `alcohol` | `bigint` | DEFAULT 0, CHECK `>= 0` | Recurso especial. |
| `dolares` | `bigint` | DEFAULT 0, CHECK `>= 0` | Moneda. |
| `ultima_recogida_recursos` | `timestamptz` | NULL | Timestamp para cálculo Lazy. |
| `UNIQUE` | Constraint | `(ciudad, barrio, edificio)` | Coordenadas únicas globales. |

---

## 2. Tablas de Estado del Juego (Game State)

### `public.habitacion_usuario`
Nivel de construcción de cada edificio en una propiedad.
| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | ID de instancia. |
| `propiedad_id` | `uuid` | FK(`public.propiedad`), ON DELETE CASCADE | Propiedad contenedora. |
| `habitacion_id` | `text` | FK(`configuracion_habitacion`) | Tipo de edificio. |
| `nivel` | `smallint` | DEFAULT 0 | Nivel actual. |
| `UNIQUE` | Constraint | `(propiedad_id, habitacion_id)` | Un tipo por propiedad. |

### `public.tropa_propiedad`
Ejército estacionado en la propiedad.
| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `propiedad_id` | `uuid` | FK(`public.propiedad`), PK Parte 1 | Propiedad. |
| `tropa_id` | `text` | FK(`configuracion_tropa`), PK Parte 2 | Tipo de unidad. |
| `cantidad` | `integer` | DEFAULT 0, CHECK `>= 0` | Número de unidades. |

### `public.entrenamiento_usuario`
Investigaciones (Tech Tree) vinculadas al usuario (globales a todas sus propiedades).
| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `usuario_id` | `uuid` | FK(`public.usuario`), PK Parte 1 | Jugador. |
| `entrenamiento_id` | `text` | FK(`configuracion_entrenamiento`), PK Parte 2 | Tech. |
| `nivel` | `integer` | DEFAULT 0 | Nivel investigado. |

---

## 3. Tablas de Configuración (Meta-Data)

### `public.configuracion_habitacion`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `text` (PK) | ID interno (ej: 'armeria'). |
| `nombre` | `text` | Nombre visible. |
| `url_imagen` | `text` | Asset gráfico. |
| `costo_armas` | `bigint` | Costo base Armas. |
| `costo_municion` | `bigint` | Costo base Munición. |
| `costo_dolares` | `bigint` | Costo base Dólares. |
| `duracion_construccion` | `integer` | Segundos base. |
| `produccion_base` | `real` | Output por nivel. |
| `recurso_producido` | `text` | Tipo de recurso output. |

### `public.configuracion_tropa`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `text` (PK) | ID interno. |
| `ataque` | `integer` | Puntos de ataque. |
| `defensa` | `integer` | Puntos de defensa. |
| `velocidad` | `bigint` | Velocidad mapa. |
| `capacidad_carga` | `integer` | Capacidad robo. |
| `requisitos` | `jsonb` | Requisitos `{ "edificio": nivel }`. |

---

## 4. Colas de Eventos (Time-Based)

### `public.cola_construccion`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | ID evento. |
| `propiedad_id` | `uuid` (FK) | Propiedad afectada. |
| `habitacion_id` | `text` (FK) | Edificio. |
| `nivel_destino` | `integer` | Nivel al finalizar. |
| `fecha_inicio` | `timestamptz` | Inicio real. |
| `fecha_fin` | `timestamptz` | Finalización programada. |

### `public.cola_misiones` (Flotas)
**Crítica para el Gameplay PvP.**
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | ID Misión. |
| `usuario_id` | `uuid` (FK) | Dueño de la flota. |
| `propiedad_origen_id` | `uuid` (FK) | Origen. |
| `tipo_mision` | `tipo_mision` (Enum) | 'atacar', 'transportar', etc. |
| `tropas` | `jsonb` | Mapa tropas `{ "maton": 10 }`. **Falta Índice GIN**. |
| `recursos` | `jsonb` | Carga `{ "armas": 100 }`. |
| `origen_*` / `destino_*` | `integer` | Coordenadas snapshot. |
| `fecha_llegada` | `timestamptz` | Impacto. |
| `fecha_regreso` | `timestamptz` | Vuelta a base. |

---

## 5. Sistema Social y Reportes

### `public.familia`
Alianzas de jugadores.
*   `id` (uuid, PK), `nombre`, `etiqueta`, `descripcion`.

### `public.informe_batalla`
Logs de combate inmutables.
*   `atacante_id`, `defensor_id` (FKs).
*   `detalles` (`jsonb`): Contiene todo el log del combate (rondas, pérdidas).
*   `ganador` (`text`).

### `public.ataque_entrante`
Tabla de "cache" para notificar a defensores rápidamente.
*   `defensor_id` (FK), `atacante_id` (FK).
*   `fecha_llegada` (timestamptz).
*   `total_tropas` (int).

---

## 6. Seguridad (Row Level Security)

Todas las tablas tienen `ENABLE ROW LEVEL SECURITY`.

*   **Configuración:** `USING (true)` para todos (Lectura pública).
*   **Propiedad:** `USING (usuario_id = auth.uid())` para UPDATE/DELETE.
*   **Colas:** `USING (EXISTS (SELECT 1 FROM propiedad WHERE ...))` (Join implícito costoso).
*   **RPCs:** Funciones críticas (`iniciar_*`) definidas con `SECURITY DEFINER` y `search_path=''`.
    *   *Riesgo:* Bypass de RLS si no se verifica `usuario_id` manualmente dentro del RPC.

---

## 7. Tipos Enumerados (Enums)

```sql
CREATE TYPE estado_invitacion AS ENUM ('pendiente', 'aceptada', 'rechazada');
CREATE TYPE rol_familia AS ENUM ('miembro', 'capitan', 'lider');
CREATE TYPE categoria_mensaje AS ENUM ('jugador', 'familia', 'sistema', 'batalla', 'espionaje');
CREATE TYPE estado_flota AS ENUM ('en_camino', 'regresando', 'estacionada', 'combatiendo');
CREATE TYPE tipo_mision AS ENUM ('atacar', 'transportar', 'espiar', 'colonizar', 'recolectar');
```
