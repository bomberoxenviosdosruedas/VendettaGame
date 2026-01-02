# Auditoría Completa de Fórmulas e Implementación Lógica

**Fecha:** 14 de Junio de 2025
**Alcance:** Revisión exhaustiva de todas las constantes, fórmulas y lógica de negocio implementada en TypeScript (`src/lib`) y PostgreSQL (`supabase/migrations`).

---

## 1. Capa TypeScript (Frontend & Utilitarios)

Esta capa contiene la **Single Source of Truth** visual para el usuario, pero no ejecuta transacciones.

### A. Datos Estáticos de Edificios (`roomsData` en `src/lib/constants.ts`)

| ID | Nombre | Costo Armas | Costo Munición | Costo Dólares | Duración Base |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `oficina_del_jefe` | Oficina del Jefe | 900 | 1800 | 0 | 00:22:30 |
| `escuela_especializacion` | Escuela de especialización | 1000 | 1000 | 25 | 00:05:33 |
| `armeria` | Armería | 12 | 60 | 0 | 00:01:23 |
| `almacen_de_municion` | Almacén de munición | 36 | 60 | 0 | 00:06:40 |
| `cerveceria` | Cervecería | 20 | 20 | 0 | 00:02:47 |
| `campo_de_entrenamiento` | Campo de entrenamiento | 1000 | 2500 | 0 | 00:15:33 |

*Observación:* Los costos definidos aquí son fijos. No hay función visible en `constants.ts` que tome `level` como argumento para retornar un costo escalado.

### B. Datos Estáticos de Entrenamiento (`trainingData` en `src/lib/data/training-data.ts`)

| ID | Nombre | Costo Armas | Costo Munición | Costo Dólares | Duración Base |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `planificacion-rutas` | Planificación de rutas | 500 | 1200 | 0 | 00:11:07 |
| `extorsion` | Extorsión | 1000 | 2000 | 0 | 00:16:40 |
| `espionaje` | Espionaje | 500 | 500 | 300 | 00:23:20 |
| `seguridad` | Seguridad | 1000 | 4000 | 1000 | 00:22:13 |

### C. Datos Estáticos de Tropas (`recruitmentData` en `src/lib/data/recruitment-data.ts`)

| ID | Nombre | Ataque | Defensa | Velocidad | Capacidad | Costo Armas | Costo Munición | Costo Dólares | Costo Alcohol | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `porteador` | Porteador | 0 | 0 | 10 | 1000 | 300 | 100 | 1000 | 0 | 01:00:00 |
| `maton` | Matón | 10 | 5 | 10 | 50 | 200 | 1000 | 0 | 0 | 00:23:20 |
| `asesino` | Asesino | 30 | 10 | 15 | 20 | 150 | 100 | 50 | 0 | 00:05:00 |
| `gorila` | Gorila | 5 | 40 | 5 | 10 | 80 | 200 | 0 | 10 | 00:08:20 |
| `consigliere` | Consigliere | 0 | 5 | 8 | 5 | 0 | 0 | 1000 | 50 | 00:15:00 |

### D. Fórmula de Distancia y Tiempo (`src/lib/utils/map-utils.ts`)

La lógica de mapa utiliza un sistema jerárquico ponderado.

```typescript
// Factores de ponderación
const DISTRICT_SCALE = 50;
const CITY_SCALE = 500;

// 1. Distancia Euclidiana Base (Grid 17 columnas)
const gridDist = Math.sqrt(Math.pow(targetX - originX, 2) + Math.pow(targetY - originY, 2));

// 2. Distancia Total (Jerárquica)
const totalDist = gridDist + (districtDiff * DISTRICT_SCALE) + (cityDiff * CITY_SCALE);

// 3. Tiempo de Viaje (Segundos)
const timeInSeconds = (totalDist / fleetSpeed) * 3600;
```

---

## 2. Capa Base de Datos (PostgreSQL RPCs)

Esta es la lógica que realmente altera el estado del juego. Extraída de `supabase/migrations/20250601000000_secure_rpc_search_path.sql`.

### A. Cálculo de Producción y Capacidad (`materializar_recursos`)

La producción se calcula de forma **LINEAL** basada en el nivel.

```plpgsql
-- Producción
v_produccion_armas := SUM(CASE WHEN ch.recurso_producido = 'armas' THEN ch.produccion_base * hu.nivel ELSE 0 END);

-- Capacidad de Almacenamiento
v_capacidad_armas := 10000 + SUM(CASE WHEN hu.habitacion_id = 'almacen_de_armas' THEN hu.nivel * 10000 ELSE 0 END);
```

### B. Fórmula de Costo de Construcción (`iniciar_construccion_habitacion`)

**Hallazgo:** El costo es ESTÁTICO y se lee directamente de la configuración. No escala.

```plpgsql
-- 1. Leer costo base de la configuración
SELECT * INTO v_configuracion_habitacion FROM public.configuracion_habitacion WHERE id = p_habitacion_id;

-- 2. Asignar costo (Sin multiplicación por nivel)
v_costo_total_armas := v_configuracion_habitacion.costo_armas;
v_costo_total_municion := v_configuracion_habitacion.costo_municion;
v_costo_total_dolares := v_configuracion_habitacion.costo_dolares;

-- 3. Deducir de la propiedad
UPDATE public.propiedad SET armas = armas - v_costo_total_armas ...
```

### C. Fórmula de Tiempo de Construcción

El tiempo base se reduce porcentualmente según el nivel de la `oficina_del_jefe`.

```plpgsql
-- 1. Obtener nivel de la oficina
SELECT nivel INTO v_nivel_oficina FROM public.habitacion_usuario WHERE ... habitacion_id = 'oficina_del_jefe';

-- 2. Calcular factor de velocidad (5% por nivel)
IF v_nivel_oficina > 0 THEN
    v_factor_velocidad := 1.0 - (v_nivel_oficina * 0.05);
END IF;

-- 3. Calcular duración final
v_duracion_final := v_configuracion_habitacion.duracion_construccion * v_factor_velocidad;
```

### D. Fórmula de Reclutamiento (`iniciar_reclutamiento`)

Costo lineal simple: `CostoUnitario * Cantidad`.

```plpgsql
-- Calcular costos totales
v_costo_total_armas := v_configuracion_tropa.costo_armas * p_cantidad;
v_costo_total_municion := v_configuracion_tropa.costo_municion * p_cantidad;
v_costo_total_dolares := v_configuracion_tropa.costo_dolares * p_cantidad;
```

---

## 3. Resumen de Divergencias Críticas

1.  **Costos Estáticos vs Progresivos:** En un MMORTS estándar, construir una mina de nivel 50 cuesta exponencialmente más que una de nivel 1. En la implementación actual (`iniciar_construccion_habitacion`), construir el nivel 50 cuesta lo mismo que el nivel 1. Esto romperá la economía del juego a largo plazo.
2.  **Hardcoding Duplicado:** Los valores de costos existen en `src/lib/constants.ts` (TS) y en la tabla `configuracion_habitacion` (SQL). No hay un mecanismo de sincronización automatizado.
3.  **Tiempos Negativos Potenciales:** La fórmula de tiempo `1.0 - (Nivel * 0.05)` llegará a 0 en nivel 20 y será negativa en nivel 21+. Falta un `MAX(0.1, ...)` o una fórmula de decaimiento logarítmico.
