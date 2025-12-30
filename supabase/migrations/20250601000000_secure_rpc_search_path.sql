-- Fix RPC Security for Construction, Research, and Recruitment
-- Reverting search_path to '' for strict security and explicit schema qualification.

-- 1. Iniciar Construcción
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 2. Iniciar Entrenamiento
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Iniciar Reclutamiento
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
