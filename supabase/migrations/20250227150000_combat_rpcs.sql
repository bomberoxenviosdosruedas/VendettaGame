-- Migration: Combat and Research RPCs

BEGIN;

-- -----------------------------------------------------------------------------
-- RPC: Iniciar Investigación
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.iniciar_investigacion(
    p_investigacion_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_nivel_actual int;
    v_costo_armas int;
    v_costo_municion int;
    v_costo_dolares int;
    v_duracion int;
    v_fin_ultimo timestamptz;
    v_config record;
    v_propiedad_id uuid; -- Payment source (main base)
BEGIN
    v_perfil_id := (SELECT auth.uid());

    -- Get Config
    SELECT * INTO v_config FROM public.configuracion_investigaciones WHERE id = p_investigacion_id;
    IF v_config IS NULL THEN
        RAISE EXCEPTION 'Investigación no válida.';
    END IF;

    -- Get Current Level
    SELECT COALESCE(nivel, 0) INTO v_nivel_actual
    FROM public.investigaciones
    WHERE perfil_id = v_perfil_id AND investigacion_id = p_investigacion_id;

    -- Calculate Costs (Base * Level+1)
    v_costo_armas := v_config.costo_armas * (v_nivel_actual + 1);
    v_costo_municion := v_config.costo_municion * (v_nivel_actual + 1);
    v_costo_dolares := v_config.costo_dolares * (v_nivel_actual + 1);
    v_duracion := v_config.duracion_base * (v_nivel_actual + 1);

    -- Get Payment Source (First base)
    SELECT id INTO v_propiedad_id FROM public.propiedades WHERE perfil_id = v_perfil_id LIMIT 1;
    IF v_propiedad_id IS NULL THEN
        RAISE EXCEPTION 'No tienes una base para financiar la investigación.';
    END IF;

    -- Check Resources
    PERFORM 1 FROM public.propiedades
    WHERE id = v_propiedad_id
    AND recursos_armas >= v_costo_armas
    AND recursos_municion >= v_costo_municion
    AND recursos_dolares >= v_costo_dolares;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recursos insuficientes.';
    END IF;

    -- Determine Start Time
    SELECT MAX(fin) INTO v_fin_ultimo FROM public.cola_investigacion WHERE perfil_id = v_perfil_id;
    IF v_fin_ultimo IS NULL OR v_fin_ultimo < now() THEN
        v_fin_ultimo := now();
    END IF;

    -- Deduct Resources
    UPDATE public.propiedades SET
        recursos_armas = recursos_armas - v_costo_armas,
        recursos_municion = recursos_municion - v_costo_municion,
        recursos_dolares = recursos_dolares - v_costo_dolares
    WHERE id = v_propiedad_id;

    -- Add to Queue
    INSERT INTO public.cola_investigacion (
        perfil_id,
        propiedad_id,
        investigacion_id,
        nivel_destino,
        inicio,
        fin
    ) VALUES (
        v_perfil_id,
        v_propiedad_id,
        p_investigacion_id,
        v_nivel_actual + 1,
        v_fin_ultimo,
        v_fin_ultimo + (v_duracion || ' seconds')::interval
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Resolver Combate (Logic Placeholder)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.resolver_combate(
    p_movimiento_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_movimiento record;
    v_defensor_id uuid;
    v_atacante_id uuid;
    v_log jsonb;
    v_resultado text;
BEGIN
    SELECT * INTO v_movimiento FROM public.movimientos_mapa WHERE id = p_movimiento_id;
    IF v_movimiento IS NULL THEN RETURN; END IF;

    -- Identify Defender (Property Owner)
    -- Find property at destination coords
    SELECT perfil_id INTO v_defensor_id
    FROM public.propiedades
    WHERE coord_x = v_movimiento.destino_x
    AND coord_y = v_movimiento.destino_y
    AND coord_z = v_movimiento.destino_z;

    v_atacante_id := v_movimiento.perfil_id;

    -- Combat Logic (Simplified Coin Flip for now)
    IF random() > 0.5 THEN
        v_resultado := 'atacante_gana';
    ELSE
        v_resultado := 'defensor_gana';
    END IF;

    -- Generate Log
    v_log := jsonb_build_object(
        'ronda_1', 'Disparos...',
        'resultado', v_resultado
    );

    -- Insert Battle Report
    INSERT INTO public.batallas (
        atacante_id,
        defensor_id,
        resultado,
        puntos_ganados_atacante,
        puntos_ganados_defensor,
        detalle_log,
        fecha
    ) VALUES (
        v_atacante_id,
        v_defensor_id,
        v_resultado,
        100, -- Placeholder points
        50,
        v_log,
        now()
    );

    -- Handle Troops (Return surviving fleet logic would go here)
    -- For now, just mark movement as processed (delete it)
    DELETE FROM public.movimientos_mapa WHERE id = p_movimiento_id;

END;
$$;

COMMIT;
