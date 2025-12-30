CREATE OR REPLACE FUNCTION public.get_dashboard_data(p_propiedad_id uuid)
RETURNS json AS $$
DECLARE
    v_propiedad record;
    v_edificios json;
    v_cola_construccion json;
    v_cola_investigacion json;
    v_cola_reclutamiento json;
    v_tropas json;
    v_investigaciones json;
    v_produccion_armas real;
    v_produccion_municion real;
    v_produccion_alcohol real;
    v_produccion_dolares real;
    v_capacidad_armas bigint;
    v_capacidad_municion bigint;
    v_capacidad_alcohol bigint;
    v_capacidad_dolares bigint;
    v_puntuacion_usuario real;
    v_usuario_id uuid;
BEGIN
    -- 0. Verificar propiedad y obtener usuario_id
    SELECT usuario_id INTO v_usuario_id FROM public.propiedad WHERE id = p_propiedad_id;

    IF v_usuario_id IS NULL THEN
        RETURN json_build_object('error', 'Propiedad no encontrada');
    END IF;

    -- Seguridad
    IF v_usuario_id != auth.uid() THEN
        RETURN json_build_object('error', 'No autorizado');
    END IF;

    -- 1. Procesar colas y materializar recursos
    PERFORM public.procesar_colas_propiedad(p_propiedad_id);
    PERFORM public.materializar_recursos(p_propiedad_id);

    -- 2. Obtener datos de la propiedad actualizados
    SELECT * INTO v_propiedad FROM public.propiedad WHERE id = p_propiedad_id;

    -- 3. Calcular producción y capacidad
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

    -- 4. Obtener edificios
    SELECT json_agg(json_build_object(
        'id', hu.habitacion_id,
        'nivel', hu.nivel,
        'nombre', ch.nombre
    )) INTO v_edificios
    FROM public.habitacion_usuario hu
    JOIN public.configuracion_habitacion ch ON hu.habitacion_id = ch.id
    WHERE hu.propiedad_id = p_propiedad_id;

    -- 5. Obtener colas
    -- Fix: Moved ORDER BY inside json_agg to prevent "column must appear in GROUP BY" error
    SELECT json_agg(json_build_object(
        'id', cc.id,
        'habitacion_id', cc.habitacion_id,
        'nivel_destino', cc.nivel_destino,
        'fecha_fin', cc.fecha_fin,
        'nombre', ch.nombre
    ) ORDER BY cc.fecha_fin) INTO v_cola_construccion
    FROM public.cola_construccion cc
    JOIN public.configuracion_habitacion ch ON cc.habitacion_id = ch.id
    WHERE cc.propiedad_id = p_propiedad_id;

    SELECT json_agg(json_build_object(
        'id', ci.id,
        'entrenamiento_id', ci.entrenamiento_id,
        'nivel_destino', ci.nivel_destino,
        'fecha_fin', ci.fecha_fin,
        'nombre', ce.nombre
    ) ORDER BY ci.fecha_fin) INTO v_cola_investigacion
    FROM public.cola_investigacion ci
    JOIN public.configuracion_entrenamiento ce ON ci.entrenamiento_id = ce.id
    WHERE ci.propiedad_id = p_propiedad_id;

    SELECT json_agg(json_build_object(
        'id', cr.id,
        'tropa_id', cr.tropa_id,
        'cantidad', cr.cantidad,
        'fecha_fin', cr.fecha_fin,
        'nombre', ct.nombre
    ) ORDER BY cr.fecha_fin) INTO v_cola_reclutamiento
    FROM public.cola_reclutamiento cr
    JOIN public.configuracion_tropa ct ON cr.tropa_id = ct.id
    WHERE cr.propiedad_id = p_propiedad_id;

    -- 6. Obtener tropas
    SELECT json_agg(json_build_object(
        'id', tp.tropa_id,
        'cantidad', tp.cantidad,
        'nombre', ct.nombre
    )) INTO v_tropas
    FROM public.tropa_propiedad tp
    JOIN public.configuracion_tropa ct ON tp.tropa_id = ct.id
    WHERE tp.propiedad_id = p_propiedad_id AND tp.cantidad > 0;

    -- 7. Obtener investigaciones
    SELECT json_agg(json_build_object(
        'id', eu.entrenamiento_id,
        'nivel', eu.nivel,
        'nombre', ce.nombre
    )) INTO v_investigaciones
    FROM public.entrenamiento_usuario eu
    JOIN public.configuracion_entrenamiento ce ON eu.entrenamiento_id = ce.id
    WHERE eu.usuario_id = v_usuario_id AND eu.nivel > 0;

    -- 8. Obtener puntuación
    SELECT puntos_totales INTO v_puntuacion_usuario FROM public.puntuacion_usuario WHERE usuario_id = v_usuario_id;

    -- Construir respuesta
    RETURN json_build_object(
        'propiedad', v_propiedad,
        'recursos', json_build_object(
            'armas', json_build_object('val', v_propiedad.armas, 'max', v_capacidad_armas, 'prod', v_produccion_armas),
            'municion', json_build_object('val', v_propiedad.municion, 'max', v_capacidad_municion, 'prod', v_produccion_municion),
            'alcohol', json_build_object('val', v_propiedad.alcohol, 'max', v_capacidad_alcohol, 'prod', v_produccion_alcohol),
            'dolares', json_build_object('val', v_propiedad.dolares, 'max', v_capacidad_dolares, 'prod', v_produccion_dolares)
        ),
        'edificios', COALESCE(v_edificios, '[]'::json),
        'colas', json_build_object(
            'construccion', COALESCE(v_cola_construccion, '[]'::json),
            'investigacion', COALESCE(v_cola_investigacion, '[]'::json),
            'reclutamiento', COALESCE(v_cola_reclutamiento, '[]'::json)
        ),
        'tropas', COALESCE(v_tropas, '[]'::json),
        'investigaciones', COALESCE(v_investigaciones, '[]'::json),
        'puntos', COALESCE(v_puntuacion_usuario, 0)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
