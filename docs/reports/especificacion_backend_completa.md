# Especificación Backend Completa (RPCs, Triggers, Policies)

**Rol:** Senior Database Architect & Supabase Expert  
**Fecha:** 26/02/2025  
**Objetivo:** Definición técnica de la implementación server-side en PostgreSQL/Supabase.

Este documento traduce los requisitos funcionales en especificaciones técnicas de base de datos, incluyendo Funciones Almacenadas (RPCs), Triggers, y Políticas de Seguridad (RLS). Se asume el uso del esquema definido en `20250226120000_esquema_espanol_completo.sql`.

---

## 1. Módulo de Autenticación y Onboarding

### 1.1 Trigger: Creación de Perfil (`on_auth_user_created`)
Este trigger se ejecuta automáticamente cuando un usuario se registra en Supabase Auth (`auth.users`).

*   **Objetivo:** Crear una entrada correspondiente en la tabla pública `perfiles` para almacenar datos del juego.
*   **Lógica:**
    1.  Extraer `full_name` de los metadatos del usuario o generar un nombre por defecto.
    2.  Insertar ID, Email y Nombre en `public.perfiles`.
    3.  Inicializar contadores de puntos en 0.

```sql
CREATE OR REPLACE FUNCTION public.manejador_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_usuario, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario ' || substr(new.id::text, 1, 8)),
    new.email
  );
  RETURN new;
END;
$$;
```

### 1.2 RPC: Inicializar Propiedad (`inicializar_propiedad`)
Función llamada desde el frontend (Setup Wizard) para crear la primera base del jugador.

*   **Inputs:** `p_nombre_propiedad` (text, opcional).
*   **Lógica:**
    1.  **Validación:** Verificar que el usuario no tenga ya una propiedad (`propiedades.perfil_id`).
    2.  **Búsqueda de Coordenadas:**
        *   Usar un loop `WHILE` limitado (ej: 100 intentos) para generar coordenadas aleatorias (X: 1-15, Y: 1-17, Z: 1-255).
        *   Verificar disponibilidad `NOT EXISTS (...)`.
    3.  **Creación de Base:** Insertar en `propiedades` con recursos iniciales (ej: 1000 de cada).
    4.  **Infraestructura Inicial:** Insertar automáticamente el edificio 'Oficina' (Nivel 1) en `edificios`.

```sql
CREATE OR REPLACE FUNCTION public.inicializar_propiedad(
  p_nombre_propiedad text DEFAULT 'Base Principal'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_perfil_id uuid := auth.uid();
  v_propiedad_id uuid;
  v_x int; v_y int; v_z int;
  v_intentos int := 0;
BEGIN
  -- 1. Validar existencia
  IF EXISTS (SELECT 1 FROM public.propiedades WHERE perfil_id = v_perfil_id) THEN
    RETURN json_build_object('error', 'El usuario ya tiene una propiedad.');
  END IF;

  -- 2. Buscar coordenadas (Estrategia Random con Reintentos)
  LOOP
    v_x := floor(random() * 15 + 1)::int;
    v_y := floor(random() * 17 + 1)::int;
    v_z := floor(random() * 255 + 1)::int;
    
    IF NOT EXISTS (SELECT 1 FROM public.propiedades WHERE coord_x=v_x AND coord_y=v_y AND coord_z=v_z) THEN
      EXIT; -- Encontrado
    END IF;
    
    v_intentos := v_intentos + 1;
    IF v_intentos > 100 THEN RAISE EXCEPTION 'Galaxia saturada, intente más tarde'; END IF;
  END LOOP;

  -- 3. Crear Propiedad
  INSERT INTO public.propiedades (perfil_id, nombre, coord_x, coord_y, coord_z, recursos_armas, recursos_municion, recursos_alcohol, recursos_dolares)
  VALUES (v_perfil_id, p_nombre_propiedad, v_x, v_y, v_z, 1000, 1000, 1000, 1000)
  RETURNING id INTO v_propiedad_id;

  -- 4. Crear Edificio Base
  INSERT INTO public.edificios (propiedad_id, edificio_id, nivel)
  VALUES (v_propiedad_id, 'oficina', 1);

  RETURN json_build_object('success', true, 'id', v_propiedad_id);
END;
$$;
```

---

## 2. Módulo de Construcción e Infraestructura

### 2.1 RPC: Iniciar Construcción (`iniciar_construccion`)
Maneja la lógica de validación e inserción en la cola de construcción.

*   **Inputs:** `p_propiedad_id` (uuid), `p_edificio_id` (text).
*   **Lógica:**
    1.  **Validar Propiedad:** Verificar que `p_propiedad_id` pertenezca a `auth.uid()`.
    2.  **Obtener Nivel Actual:** Consultar `edificios` (si no existe, nivel es 0).
    3.  **Calcular Costos:** Consultar `configuracion_edificios` y aplicar fórmula de costo (ej: `Base * 2^Nivel`).
    4.  **Validar Recursos:** Verificar si `propiedades.recursos_* >= Costo`.
    5.  **Validar Cola:** Verificar que `COUNT(cola_construccion) < 5`.
    6.  **Transacción:**
        *   Restar recursos en `propiedades`.
        *   Calcular tiempo de fin (`NOW() + duracion`). Si hay cola, sumar al tiempo del último en cola.
        *   Insertar en `cola_construccion`.

```sql
CREATE OR REPLACE FUNCTION iniciar_construccion(
  p_propiedad_id uuid,
  p_edificio_id text
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_nivel_actual int;
  v_costo_armas numeric;
  v_tiempo int;
  v_fin_ultimo timestamptz;
BEGIN
  -- Validaciones básicas omitidas por brevedad...
  
  -- Calcular Costo (Simplificado)
  SELECT COALESCE(e.nivel, 0) INTO v_nivel_actual
  FROM public.edificios e 
  WHERE e.propiedad_id = p_propiedad_id AND e.edificio_id = p_edificio_id;
  
  -- Bloquear fila de propiedad para actualización atómica
  PERFORM 1 FROM public.propiedades WHERE id = p_propiedad_id FOR UPDATE;
  
  -- Insertar en cola
  SELECT COALESCE(MAX(fin), NOW()) INTO v_fin_ultimo 
  FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id;
  
  INSERT INTO public.cola_construccion (propiedad_id, edificio_id, nivel_destino, inicio, fin)
  VALUES (p_propiedad_id, p_edificio_id, COALESCE(v_nivel_actual, 0) + 1, v_fin_ultimo, v_fin_ultimo + interval '1 hour'); -- Tiempo placeholder
  
  RETURN json_build_object('success', true);
END;
$$;
```

### 2.2 Trigger/Cron: Procesar Cola (`procesar_cola_construccion`)
En un entorno serverless, no hay demonios persistentes.
*   **Estrategia:** "Lazy Evaluation" + Cronjob de respaldo.
*   **Implementación:**
    1.  Cuando el usuario consulta `/dashboard`, se ejecuta una función ligera que verifica si `NOW() > fin` de algún item en cola.
    2.  Si es así, aplica los cambios (`UPDATE edificios`) y borra de la cola.
    3.  Un Cron de Supabase (pg_cron) ejecuta esto cada minuto para usuarios offline (importante para que la producción se recalcule correctamente).

---

## 3. Módulo de Recursos y Producción

### 3.1 Función: Actualizar Recursos (`actualizar_recursos`)
Esta es la función más crítica del juego. Debe ser idempotente.

*   **Inputs:** `p_propiedad_id` (uuid).
*   **Lógica:**
    1.  Obtener `ultima_actualizacion` y recursos actuales.
    2.  Calcular `delta_tiempo` (segundos desde última actualización).
    3.  Obtener tasas de producción horaria de todos los edificios activos en esa propiedad.
    4.  `NuevoRecurso = RecursoActual + (Tasa * delta_tiempo)`.
    5.  Aplicar límites de almacenamiento (Capacidad de almacenes).
    6.  `UPDATE propiedades SET recursos=..., ultima_actualizacion=NOW()`.

```sql
CREATE OR REPLACE FUNCTION actualizar_recursos(p_propiedad_id uuid) 
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_propiedad record;
  v_produccion record;
  v_segundos numeric;
BEGIN
  SELECT * INTO v_propiedad FROM public.propiedades WHERE id = p_propiedad_id FOR UPDATE;
  
  v_segundos := EXTRACT(EPOCH FROM (NOW() - v_propiedad.ultima_actualizacion));
  
  -- Sumar producción de todos los edificios
  -- (Requiere join con config y edificios)
  
  UPDATE public.propiedades 
  SET 
    recursos_armas = recursos_armas + (10 * v_segundos), -- Ejemplo
    ultima_actualizacion = NOW()
  WHERE id = p_propiedad_id;
END;
$$;
```

---

## 4. Módulo Militar

### 4.1 RPC: Enviar Flota (`enviar_flota`)
Maneja el movimiento de tropas entre coordenadas.

*   **Inputs:** `origen_id`, `destino_x`, `destino_y`, `destino_z`, `mision` (ataque, transporte), `tropas` (json).
*   **Lógica:**
    1.  **Validar Propiedad de Tropas:** Verificar que el origen tenga la cantidad de tropas solicitada.
    2.  **Calcular Distancia y Tiempo:** `Distancia = SQRT((x2-x1)^2 + (y2-y1)^2)`.
    3.  **Consumo:** Calcular gasto de combustible/recursos.
    4.  **Movimiento:**
        *   Restar tropas de la tabla `tropas` (origen).
        *   Insertar en `movimientos_mapa`.

### 4.2 Concepto: Resolver Batalla
Debe ser una función PL/pgSQL llamada cuando una flota de ataque llega (`llegada <= NOW()`).

*   **Lógica:**
    1.  Cargar tropas atacantes (del JSON del movimiento) y defensoras (de tabla `tropas` destino).
    2.  Simular rondas (loop).
    3.  Calcular pérdidas.
    4.  Generar reporte JSONB.
    5.  Insertar en `batallas`.
    6.  Si gana atacante, transferir recursos (robo).
    7.  Manejar el regreso de la flota superviviente (crear nuevo movimiento de retorno).

---

## 5. Módulo de Mercado

### 5.1 RPC: Comprar Oferta (`comprar_oferta`)
Garantiza transacciones atómicas entre jugadores.

*   **Inputs:** `p_oferta_id` (uuid).
*   **Lógica:**
    1.  `SELECT ... FOR UPDATE` sobre la oferta para evitar doble compra.
    2.  Verificar que la oferta no esté expirada ni vendida.
    3.  Verificar que el comprador (`auth.uid()`) tenga los recursos que pide el vendedor.
    4.  **Transferencia:**
        *   Restar recursos al comprador.
        *   Sumar recursos al vendedor (o iniciar transporte si el juego requiere tiempo de viaje).
        *   Sumar el recurso vendido al comprador.
    5.  Marcar oferta como `aceptada = true`.

---

## 6. Seguridad (Row Level Security)

Es vital configurar correctamente las políticas RLS para evitar trampas.

### 6.1 Tabla `perfiles`
*   **Select:** `public` (Cualquiera puede ver el perfil básico de otros para ranking/mensajes).
*   **Update:** `auth.uid() = id` (Solo el dueño puede editar su bio/avatar).

### 6.2 Tabla `propiedades`
*   **Select:** `public` (Necesario para el mapa de la galaxia).
*   **Update:** `auth.uid() = perfil_id` (Solo el dueño actualiza nombre, pero OJO: los recursos solo deben tocarse via RPCs `SECURITY DEFINER` para asegurar reglas de juego).

### 6.3 Tabla `mensajes`
*   **Select:** `auth.uid() = remitente_id OR auth.uid() = destinatario_id`.
*   **Insert:** `auth.uid() = remitente_id` (Cualquiera puede enviar, pero solo a su nombre).

### 6.4 Tabla `movimientos_mapa`
*   **Select:**
    *   Dueño: `perfil_id = auth.uid()`.
    *   Destinatario (si es ataque): `destino_propiedad_id IN (SELECT id FROM propiedades WHERE perfil_id = auth.uid())`.
    *   *Nota:* Esto permite ver ataques entrantes.

### 6.5 Tablas de Configuración
*   **Select:** `true` (Públicas para todos).
*   **Write:** `false` (Solo administradores/DBA).
