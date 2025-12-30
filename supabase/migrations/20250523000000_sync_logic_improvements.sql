-- 20250523000000_sync_logic_improvements.sql

-- 1. Fix: Inicializar ultima_recogida_recursos si es null para evitar bloqueo de producción
UPDATE public.propiedad
SET ultima_recogida_recursos = NOW()
WHERE ultima_recogida_recursos IS NULL;

-- 2. Función Lazy Update Scoped (Por Propiedad)
-- Esta función procesa las colas SOLO para la propiedad específica, evitando iterar sobre toda la BD.
CREATE OR REPLACE FUNCTION public.procesar_colas_propiedad(p_propiedad_id uuid)
RETURNS void AS $$
DECLARE
    v_item_construccion record;
    v_item_investigacion record;
    v_item_reclutamiento record;
    v_usuario_id uuid;
BEGIN
    -- Verificar propiedad de la propiedad
    SELECT usuario_id INTO v_usuario_id FROM public.propiedad WHERE id = p_propiedad_id;

    IF v_usuario_id IS NULL OR v_usuario_id != auth.uid() THEN
        -- Si no existe o no es del usuario, no hacemos nada (seguridad silenciosa) o lanzamos error.
        -- Para evitar leaks de informacion, simplemente retornamos.
        RETURN;
    END IF;

    -- Procesar cola de construcción
    FOR v_item_construccion IN SELECT * FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id AND fecha_fin <= NOW() LOOP
        IF EXISTS (SELECT 1 FROM public.habitacion_usuario WHERE propiedad_id = v_item_construccion.propiedad_id AND habitacion_id = v_item_construccion.habitacion_id) THEN
            UPDATE public.habitacion_usuario SET nivel = nivel + 1 WHERE propiedad_id = v_item_construccion.propiedad_id AND habitacion_id = v_item_construccion.habitacion_id;
        ELSE
            INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel) VALUES (v_item_construccion.propiedad_id, v_item_construccion.habitacion_id, 1);
        END IF;
        DELETE FROM public.cola_construccion WHERE id = v_item_construccion.id;
    END LOOP;

    -- Procesar cola de investigación (Nota: la cola está vinculada a propiedad, el resultado a usuario)
    FOR v_item_investigacion IN SELECT * FROM public.cola_investigacion WHERE propiedad_id = p_propiedad_id AND fecha_fin <= NOW() LOOP
        INSERT INTO public.entrenamiento_usuario (usuario_id, entrenamiento_id, nivel)
        VALUES (v_item_investigacion.usuario_id, v_item_investigacion.entrenamiento_id, 1)
        ON CONFLICT (usuario_id, entrenamiento_id) DO UPDATE SET nivel = public.entrenamiento_usuario.nivel + 1;
        DELETE FROM public.cola_investigacion WHERE id = v_item_investigacion.id;
    END LOOP;

    -- Procesar cola de reclutamiento
    FOR v_item_reclutamiento IN SELECT * FROM public.cola_reclutamiento WHERE propiedad_id = p_propiedad_id AND fecha_fin <= NOW() LOOP
        INSERT INTO public.tropa_propiedad (propiedad_id, tropa_id, cantidad)
        VALUES (v_item_reclutamiento.propiedad_id, v_item_reclutamiento.tropa_id, v_item_reclutamiento.cantidad)
        ON CONFLICT (propiedad_id, tropa_id) DO UPDATE SET cantidad = public.tropa_propiedad.cantidad + v_item_reclutamiento.cantidad;
        DELETE FROM public.cola_reclutamiento WHERE id = v_item_reclutamiento.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. RPC para Iniciar Misión (Seguridad y Lógica)
CREATE OR REPLACE FUNCTION public.iniciar_mision(
    p_propiedad_origen_id uuid,
    p_tipo_mision public.tipo_mision,
    p_tropas jsonb, -- { "tropa_id": "cantidad" (como string o int) }
    p_recursos jsonb, -- { "armas": 100 }
    p_destino_ciudad integer,
    p_destino_barrio integer,
    p_destino_edificio integer,
    p_velocidad_flota integer DEFAULT 100
)
RETURNS json AS $$
DECLARE
    v_propiedad_origen record;
    v_tropa_key text;
    v_cantidad_tropa_val jsonb;
    v_cantidad_tropa int;
    v_tropa_disponible int;
    v_duracion_viaje int := 60; -- Placeholder: Calcular en base a distancia y velocidad
    v_mission_id uuid;
BEGIN
    -- Verificar propiedad origen y pertenencia
    SELECT * INTO v_propiedad_origen FROM public.propiedad WHERE id = p_propiedad_origen_id;

    IF v_propiedad_origen IS NULL THEN
        RETURN json_build_object('error', 'Propiedad no encontrada.');
    END IF;

    IF v_propiedad_origen.usuario_id != auth.uid() THEN
         RETURN json_build_object('error', 'No eres el dueño de la propiedad de origen.');
    END IF;

    -- Validar y deducir tropas
    -- Iteramos sobre las llaves del jsonb de tropas
    FOR v_tropa_key IN SELECT jsonb_object_keys(p_tropas) LOOP
        -- Obtener cantidad como entero (maneja si viene como string o numero)
        v_cantidad_tropa := (p_tropas ->> v_tropa_key)::integer;

        IF v_cantidad_tropa > 0 THEN
            SELECT cantidad INTO v_tropa_disponible FROM public.tropa_propiedad
            WHERE propiedad_id = p_propiedad_origen_id AND tropa_id = v_tropa_key;

            IF COALESCE(v_tropa_disponible, 0) < v_cantidad_tropa THEN
                RETURN json_build_object('error', 'Tropas insuficientes: ' || v_tropa_key);
            END IF;

            -- Deducir tropa
            UPDATE public.tropa_propiedad
            SET cantidad = cantidad - v_cantidad_tropa
            WHERE propiedad_id = p_propiedad_origen_id AND tropa_id = v_tropa_key;
        END IF;
    END LOOP;

    -- Insertar misión
    INSERT INTO public.cola_misiones (
        usuario_id, propiedad_origen_id, tipo_mision, tropas, recursos,
        origen_ciudad, origen_barrio, origen_edificio,
        destino_ciudad, destino_barrio, destino_edificio,
        fecha_inicio, fecha_llegada, velocidad_flota, duracion_viaje
    ) VALUES (
        auth.uid(), p_propiedad_origen_id, p_tipo_mision, p_tropas, p_recursos,
        v_propiedad_origen.coordenada_ciudad, v_propiedad_origen.coordenada_barrio, v_propiedad_origen.coordenada_edificio,
        p_destino_ciudad, p_destino_barrio, p_destino_edificio,
        NOW(), NOW() + make_interval(secs => v_duracion_viaje), p_velocidad_flota, v_duracion_viaje
    ) RETURNING id INTO v_mission_id;

    RETURN json_build_object('success', true, 'mision_id', v_mission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Actualizar crear_propiedad_inicial para setear ultima_recogida_recursos
CREATE OR REPLACE FUNCTION public.crear_propiedad_inicial(p_nombre text, p_ciudad integer, p_barrio integer, p_edificio integer)
RETURNS json AS $$
DECLARE
    v_propiedad_id uuid;
BEGIN
    -- Verificar si el usuario ya tiene una propiedad
    IF EXISTS (SELECT 1 FROM public.propiedad WHERE usuario_id = auth.uid()) THEN
        RETURN json_build_object('error', 'El usuario ya tiene una propiedad.');
    END IF;

    -- Verificar unicidad de coordenadas
    IF EXISTS (SELECT 1 FROM public.propiedad WHERE coordenada_ciudad = p_ciudad AND coordenada_barrio = p_barrio AND coordenada_edificio = p_edificio) THEN
        RETURN json_build_object('error', 'Las coordenadas ya están ocupadas.');
    END IF;

    -- Insertar la nueva propiedad con timestamp inicial
    INSERT INTO public.propiedad (usuario_id, nombre, coordenada_ciudad, coordenada_barrio, coordenada_edificio, armas, municion, alcohol, dolares, ultima_recogida_recursos)
    VALUES (auth.uid(), p_nombre, p_ciudad, p_barrio, p_edificio, 500, 500, 500, 500, NOW())
    RETURNING id INTO v_propiedad_id;

    -- Insertar habitaciones iniciales
    INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel)
    VALUES
        (v_propiedad_id, 'oficina_del_jefe', 1),
        (v_propiedad_id, 'armeria', 1),
        (v_propiedad_id, 'cerveceria', 1);

    -- Actualizar el estado del primer login del usuario
    UPDATE public.usuario SET primer_login = true WHERE id = auth.uid();

    RETURN json_build_object('success', true, 'propiedad_id', v_propiedad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
