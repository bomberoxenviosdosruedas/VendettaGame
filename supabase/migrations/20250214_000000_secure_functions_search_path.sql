-- 1. Gestión de Recursos (Lazy Calculation)
CREATE OR REPLACE FUNCTION public.materializar_recursos(p_propiedad_id uuid)
RETURNS void AS $$
DECLARE
    v_propiedad record;
    v_delta_tiempo real;
    v_produccion_armas real;
    v_produccion_municion real;
    v_produccion_alcohol real;
    v_produccion_dolares real;
    v_capacidad_armas bigint;
    v_capacidad_municion bigint;
    v_capacidad_alcohol bigint;
    v_capacidad_dolares bigint;
    v_nuevo_stock_armas bigint;
    v_nuevo_stock_municion bigint;
    v_nuevo_stock_alcohol bigint;
    v_nuevo_stock_dolares bigint;
    v_consumo_alcohol real;
    v_factor_conversion_alcohol_dolares real := 1.0; -- Ajustar este valor según la configuración del juego
BEGIN
    -- Bloquear la fila de propiedad para evitar condiciones de carrera
    SELECT * INTO v_propiedad FROM public.propiedad WHERE id = p_propiedad_id FOR UPDATE;

    -- Calcular el tiempo transcurrido desde la última actualización
    v_delta_tiempo := EXTRACT(EPOCH FROM (NOW() - v_propiedad.ultima_recogida_recursos));

    -- Si no ha pasado tiempo, salir
    IF v_delta_tiempo <= 0 THEN
        RETURN;
    END IF;

    -- Calcular la Tasa de Producción por Recurso
    SELECT
        COALESCE(SUM(CASE WHEN ch.recurso_producido = 'armas' THEN ch.produccion_base * hu.nivel ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN ch.recurso_producido = 'municion' THEN ch.produccion_base * hu.nivel ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN ch.recurso_producido = 'alcohol' THEN ch.produccion_base * hu.nivel ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN ch.recurso_producido = 'dolares_por_alcohol' THEN ch.produccion_base * hu.nivel ELSE 0 END), 0)
    INTO
        v_produccion_armas,
        v_produccion_municion,
        v_produccion_alcohol,
        v_produccion_dolares
    FROM public.habitacion_usuario hu
    JOIN public.configuracion_habitacion ch ON hu.habitacion_id = ch.id
    WHERE hu.propiedad_id = p_propiedad_id;

    -- Calcular Capacidad de Almacenamiento
    SELECT
        10000 + COALESCE(SUM(CASE WHEN hu.habitacion_id = 'almacen_de_armas' THEN hu.nivel * 10000 ELSE 0 END), 0),
        10000 + COALESCE(SUM(CASE WHEN hu.habitacion_id = 'deposito_de_municion' THEN hu.nivel * 10000 ELSE 0 END), 0),
        10000 + COALESCE(SUM(CASE WHEN hu.habitacion_id = 'almacen_de_alcohol' THEN hu.nivel * 10000 ELSE 0 END), 0),
        10000 + COALESCE(SUM(CASE WHEN hu.habitacion_id = 'caja_fuerte' THEN hu.nivel * 10000 ELSE 0 END), 0)
    INTO
        v_capacidad_armas,
        v_capacidad_municion,
        v_capacidad_alcohol,
        v_capacidad_dolares
    FROM public.habitacion_usuario hu
    WHERE hu.propiedad_id = p_propiedad_id;

    -- Conversión Especial (Alcohol a Dólares)
    IF v_produccion_dolares > 0 THEN
        v_consumo_alcohol := (v_produccion_dolares / v_factor_conversion_alcohol_dolares) * v_delta_tiempo;
        IF v_propiedad.alcohol < v_consumo_alcohol THEN
            -- Ajustar producción de dólares si no hay suficiente alcohol
            v_produccion_dolares := (v_propiedad.alcohol / v_delta_tiempo) * v_factor_conversion_alcohol_dolares;
            v_propiedad.alcohol := 0;
        ELSE
            v_propiedad.alcohol := v_propiedad.alcohol - v_consumo_alcohol;
        END IF;
    END IF;

    -- Actualizar Stocks
    v_nuevo_stock_armas := LEAST(v_capacidad_armas, v_propiedad.armas + (v_produccion_armas * v_delta_tiempo));
    v_nuevo_stock_municion := LEAST(v_capacidad_municion, v_propiedad.municion + (v_produccion_municion * v_delta_tiempo));
    v_nuevo_stock_alcohol := LEAST(v_capacidad_alcohol, v_propiedad.alcohol + (v_produccion_alcohol * v_delta_tiempo));
    v_nuevo_stock_dolares := LEAST(v_capacidad_dolares, v_propiedad.dolares + (v_produccion_dolares * v_delta_tiempo));

    -- Actualizar la tabla de propiedad
    UPDATE public.propiedad
    SET
        armas = v_nuevo_stock_armas,
        municion = v_nuevo_stock_municion,
        alcohol = v_nuevo_stock_alcohol,
        dolares = v_nuevo_stock_dolares,
        ultima_recogida_recursos = NOW()
    WHERE id = p_propiedad_id;

END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 2. Colas de Construcción
CREATE OR REPLACE FUNCTION public.iniciar_construccion_habitacion(p_propiedad_id uuid, p_habitacion_id text)
RETURNS json AS $$
DECLARE
    v_configuracion_habitacion record;
    v_propiedad record;
    v_costo_total_armas bigint;
    v_costo_total_municion bigint;
    v_costo_total_dolares bigint;
    v_fecha_inicio timestamptz;
    v_fecha_fin timestamptz;
    v_duracion_final integer;
    v_nivel_oficina smallint;
    v_factor_velocidad real := 1.0;
    v_cola_count integer;
    v_nivel_destino integer;
BEGIN
    -- Materializar recursos
    PERFORM public.materializar_recursos(p_propiedad_id);

    -- Obtener configuración de la habitación y datos de la propiedad
    SELECT * INTO v_configuracion_habitacion FROM public.configuracion_habitacion WHERE id = p_habitacion_id;
    SELECT * INTO v_propiedad FROM public.propiedad WHERE id = p_propiedad_id;

    -- Verificar requisitos previos
    IF EXISTS (
        SELECT 1
        FROM public.requisito_habitacion rh
        WHERE rh.habitacion_id = p_habitacion_id
        AND NOT EXISTS (
            SELECT 1
            FROM public.habitacion_usuario hu
            WHERE hu.propiedad_id = p_propiedad_id
            AND hu.habitacion_id = rh.habitacion_requerida_id
            AND hu.nivel >= rh.nivel_requerido
        )
    ) THEN
        RETURN json_build_object('error', 'Requisitos de construcción no cumplidos.');
    END IF;

    -- Verificar cola llena
    SELECT COUNT(*) INTO v_cola_count FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id;
    IF v_cola_count >= 5 THEN
        RETURN json_build_object('error', 'La cola de construcción está llena.');
    END IF;

    -- Calcular costos
    v_costo_total_armas := v_configuracion_habitacion.costo_armas;
    v_costo_total_municion := v_configuracion_habitacion.costo_municion;
    v_costo_total_dolares := v_configuracion_habitacion.costo_dolares;

    -- Verificar recursos suficientes
    IF v_propiedad.armas < v_costo_total_armas OR v_propiedad.municion < v_costo_total_municion OR v_propiedad.dolares < v_costo_total_dolares THEN
        RETURN json_build_object('error', 'Recursos insuficientes.');
    END IF;

    -- Deducir recursos
    UPDATE public.propiedad
    SET
        armas = armas - v_costo_total_armas,
        municion = municion - v_costo_total_municion,
        dolares = dolares - v_costo_total_dolares
    WHERE id = p_propiedad_id;

    -- Calcular fecha de inicio y fin
    SELECT COALESCE(MAX(fecha_fin), NOW()) INTO v_fecha_inicio FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id;

    -- Aplicar factor de velocidad de la oficina
    SELECT nivel INTO v_nivel_oficina FROM public.habitacion_usuario WHERE propiedad_id = p_propiedad_id AND habitacion_id = 'oficina_del_jefe';
    IF v_nivel_oficina > 0 THEN
        v_factor_velocidad := 1.0 - (v_nivel_oficina * 0.05); -- 5% de reducción por nivel
    END IF;
    v_duracion_final := v_configuracion_habitacion.duracion_construccion * v_factor_velocidad;
    v_fecha_fin := v_fecha_inicio + make_interval(secs => v_duracion_final);

    -- Calcular el nivel de destino correcto
    SELECT
        GREATEST(
            (SELECT COALESCE(MAX(nivel), 0) FROM public.habitacion_usuario WHERE propiedad_id = p_propiedad_id AND habitacion_id = p_habitacion_id),
            (SELECT COALESCE(MAX(nivel_destino), 0) FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id AND habitacion_id = p_habitacion_id)
        ) + 1
    INTO v_nivel_destino;

    -- Insertar en la cola de construcción
    INSERT INTO public.cola_construccion (propiedad_id, habitacion_id, nivel_destino, duracion_segundos, fecha_inicio, fecha_fin)
    VALUES (p_propiedad_id, p_habitacion_id, v_nivel_destino, v_duracion_final, v_fecha_inicio, v_fecha_fin);

    RETURN json_build_object('success', true, 'fecha_inicio', v_fecha_inicio, 'fecha_fin', v_fecha_fin);
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE OR REPLACE FUNCTION public.procesar_colas()
RETURNS void AS $$
DECLARE
    v_item_construccion record;
    v_item_investigacion record;
    v_item_reclutamiento record;
BEGIN
    -- Procesar cola de construcción
    FOR v_item_construccion IN SELECT * FROM public.cola_construccion WHERE fecha_fin <= NOW() LOOP
        -- Actualizar o insertar habitación
        IF EXISTS (SELECT 1 FROM public.habitacion_usuario WHERE propiedad_id = v_item_construccion.propiedad_id AND habitacion_id = v_item_construccion.habitacion_id) THEN
            UPDATE public.habitacion_usuario SET nivel = nivel + 1 WHERE propiedad_id = v_item_construccion.propiedad_id AND habitacion_id = v_item_construccion.habitacion_id;
        ELSE
            INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel) VALUES (v_item_construccion.propiedad_id, v_item_construccion.habitacion_id, 1);
        END IF;
        -- Eliminar de la cola
        DELETE FROM public.cola_construccion WHERE id = v_item_construccion.id;
    END LOOP;

    -- Procesar cola de investigación
    FOR v_item_investigacion IN SELECT * FROM public.cola_investigacion WHERE fecha_fin <= NOW() LOOP
        INSERT INTO public.entrenamiento_usuario (usuario_id, entrenamiento_id, nivel)
        VALUES (v_item_investigacion.usuario_id, v_item_investigacion.entrenamiento_id, 1)
        ON CONFLICT (usuario_id, entrenamiento_id) DO UPDATE SET nivel = public.entrenamiento_usuario.nivel + 1;
        DELETE FROM public.cola_investigacion WHERE id = v_item_investigacion.id;
    END LOOP;

    -- Procesar cola de reclutamiento
    FOR v_item_reclutamiento IN SELECT * FROM public.cola_reclutamiento WHERE fecha_fin <= NOW() LOOP
        INSERT INTO public.tropa_propiedad (propiedad_id, tropa_id, cantidad)
        VALUES (v_item_reclutamiento.propiedad_id, v_item_reclutamiento.tropa_id, v_item_reclutamiento.cantidad)
        ON CONFLICT (propiedad_id, tropa_id) DO UPDATE SET cantidad = public.tropa_propiedad.cantidad + v_item_reclutamiento.cantidad;
        DELETE FROM public.cola_reclutamiento WHERE id = v_item_reclutamiento.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 3. Entrenamiento e Investigación
CREATE OR REPLACE FUNCTION public.iniciar_entrenamiento(p_propiedad_id uuid, p_entrenamiento_id text)
RETURNS json AS $$
DECLARE
    v_configuracion_entrenamiento record;
    v_propiedad record;
    v_usuario_id uuid;
BEGIN
    -- Materializar recursos
    PERFORM public.materializar_recursos(p_propiedad_id);

    -- Obtener usuario_id de la propiedad
    SELECT usuario_id INTO v_usuario_id FROM public.propiedad WHERE id = p_propiedad_id;

    -- Validar que no haya otra investigación en curso
    IF EXISTS (SELECT 1 FROM public.cola_investigacion WHERE propiedad_id = p_propiedad_id) THEN
        RETURN json_build_object('error', 'Ya hay una investigación en curso.');
    END IF;

    -- Obtener configuración y datos
    SELECT * INTO v_configuracion_entrenamiento FROM public.configuracion_entrenamiento WHERE id = p_entrenamiento_id;
    SELECT * INTO v_propiedad FROM public.propiedad WHERE id = p_propiedad_id;

    -- Verificar requisitos
    IF EXISTS (
        SELECT 1
        FROM public.requisito_entrenamiento re
        WHERE re.entrenamiento_id = p_entrenamiento_id
        AND NOT EXISTS (
            SELECT 1
            FROM public.entrenamiento_usuario eu
            WHERE eu.usuario_id = v_usuario_id
            AND eu.entrenamiento_id = re.entrenamiento_requerido_id
            AND eu.nivel >= re.nivel_requerido
        )
    ) THEN
        RETURN json_build_object('error', 'Requisitos de entrenamiento no cumplidos.');
    END IF;

    -- Verificar y deducir recursos
    IF v_propiedad.armas < v_configuracion_entrenamiento.costo_armas OR v_propiedad.municion < v_configuracion_entrenamiento.costo_municion OR v_propiedad.dolares < v_configuracion_entrenamiento.costo_dolares THEN
        RETURN json_build_object('error', 'Recursos insuficientes.');
    END IF;

    UPDATE public.propiedad
    SET
        armas = armas - v_configuracion_entrenamiento.costo_armas,
        municion = municion - v_configuracion_entrenamiento.costo_municion,
        dolares = dolares - v_configuracion_entrenamiento.costo_dolares
    WHERE id = p_propiedad_id;

    -- Insertar en la cola de investigación
    INSERT INTO public.cola_investigacion (usuario_id, propiedad_id, entrenamiento_id, nivel_destino, fecha_inicio, fecha_fin)
    VALUES (v_usuario_id, p_propiedad_id, p_entrenamiento_id, (SELECT COALESCE(MAX(nivel), 0) + 1 FROM public.entrenamiento_usuario WHERE usuario_id = v_usuario_id AND entrenamiento_id = p_entrenamiento_id), NOW(), NOW() + make_interval(secs => v_configuracion_entrenamiento.duracion_entrenamiento));

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 4. Reclutamiento de Tropas
CREATE OR REPLACE FUNCTION public.iniciar_reclutamiento(p_propiedad_id uuid, p_tropa_id text, p_cantidad integer)
RETURNS json AS $$
DECLARE
    v_configuracion_tropa record;
    v_propiedad record;
    v_costo_total_armas bigint;
    v_costo_total_municion bigint;
    v_costo_total_dolares bigint;
BEGIN
    -- Materializar recursos
    PERFORM public.materializar_recursos(p_propiedad_id);

    -- Validar que no haya otro reclutamiento en curso
    IF EXISTS (SELECT 1 FROM public.cola_reclutamiento WHERE propiedad_id = p_propiedad_id) THEN
        RETURN json_build_object('error', 'Ya hay un reclutamiento en curso.');
    END IF;

    -- Obtener configuración y datos
    SELECT * INTO v_configuracion_tropa FROM public.configuracion_tropa WHERE id = p_tropa_id;
    SELECT * INTO v_propiedad FROM public.propiedad WHERE id = p_propiedad_id;

    -- Calcular costos totales
    v_costo_total_armas := v_configuracion_tropa.costo_armas * p_cantidad;
    v_costo_total_municion := v_configuracion_tropa.costo_municion * p_cantidad;
    v_costo_total_dolares := v_configuracion_tropa.costo_dolares * p_cantidad;

    -- Verificar requisitos
    IF EXISTS (
        SELECT 1
        FROM jsonb_each_text(v_configuracion_tropa.requisitos) AS req
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.habitacion_usuario hu
            WHERE hu.propiedad_id = p_propiedad_id
            AND hu.habitacion_id = req.key
            AND hu.nivel >= (req.value)::integer
        )
    ) THEN
        RETURN json_build_object('error', 'Requisitos de reclutamiento no cumplidos.');
    END IF;

    -- Verificar y deducir recursos
    IF v_propiedad.armas < v_costo_total_armas OR v_propiedad.municion < v_costo_total_municion OR v_propiedad.dolares < v_costo_total_dolares THEN
        RETURN json_build_object('error', 'Recursos insuficientes.');
    END IF;

    UPDATE public.propiedad
    SET
        armas = armas - v_costo_total_armas,
        municion = municion - v_costo_total_municion,
        dolares = dolares - v_costo_total_dolares
    WHERE id = p_propiedad_id;

    -- Insertar en la cola de reclutamiento
    INSERT INTO public.cola_reclutamiento (propiedad_id, tropa_id, cantidad, fecha_inicio, fecha_fin)
    VALUES (p_propiedad_id, p_tropa_id, p_cantidad, NOW(), NOW() + make_interval(secs => v_configuracion_tropa.duracion_reclutamiento * p_cantidad));

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- 5. Onboarding y Creación de Usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuario (id, email, nombre_usuario)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  INSERT INTO public.puntuacion_usuario (usuario_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

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

    -- Insertar la nueva propiedad
    INSERT INTO public.propiedad (usuario_id, nombre, coordenada_ciudad, coordenada_barrio, coordenada_edificio, armas, municion, alcohol, dolares, ultima_recogida_recursos)
    VALUES (auth.uid(), p_nombre, p_ciudad, p_barrio, p_edificio, 500, 500, 500, 500, now())
    RETURNING id INTO v_propiedad_id;

    -- Insertar habitaciones iniciales
    INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel)
    VALUES
        (v_propiedad_id, 'oficina_del_jefe', 1),
        (v_propiedad_id, 'escuela_especializacion', 1),
        (v_propiedad_id, 'armeria', 1),
        (v_propiedad_id, 'deposito_de_municion', 1),
        (v_propiedad_id, 'cerveceria', 1),
        (v_propiedad_id, 'taberna', 1),
        (v_propiedad_id, 'campo_de_entrenamiento', 1);

    -- Actualizar el estado del primer login del usuario
    UPDATE public.usuario SET primer_login = true WHERE id = auth.uid();

    RETURN json_build_object('success', true, 'propiedad_id', v_propiedad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
