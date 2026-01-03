-- Migration: Fleet RPCs

BEGIN;

-- -----------------------------------------------------------------------------
-- RPC: Enviar Flota (Simplificado)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enviar_flota(
    p_origen_id uuid,
    p_destino_x int,
    p_destino_y int,
    p_destino_z int,
    p_mision text, -- 'atacar', 'transportar', 'espiar'
    p_tropas jsonb, -- {'tropa_id': cantidad}
    p_recursos jsonb DEFAULT '{}'::jsonb
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_origen record;
    v_distancia numeric;
    v_tiempo_segundos int;
    v_llegada timestamptz;
    v_tropa_key text;
    v_cantidad int;
    v_tropa_disp int;
    v_velocidad_min int := 999999;
    v_capacidad_total int := 0;
    v_peso_recursos int := 0;
    v_tropas_config record;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    -- Validate Origin Ownership
    SELECT * INTO v_origen FROM public.propiedades WHERE id = p_origen_id AND perfil_id = v_perfil_id;
    IF v_origen IS NULL THEN
        RAISE EXCEPTION 'Origen no válido.';
    END IF;

    -- Calculate Distance (Simple Euclidean for now)
    v_distancia := sqrt(power(v_origen.coord_x - p_destino_x, 2) + power(v_origen.coord_y - p_destino_y, 2)) * 100; -- Scale factor
    if v_distancia = 0 then v_distancia := 50; end if; -- Same system travel

    -- Validate Troops & Calculate Speed/Capacity
    FOR v_tropa_key, v_cantidad IN SELECT * FROM jsonb_each_text(p_tropas)
    LOOP
        v_cantidad := v_cantidad::int;
        IF v_cantidad > 0 THEN
            -- Check availability
            SELECT cantidad INTO v_tropa_disp FROM public.tropas WHERE propiedad_id = p_origen_id AND tropa_id = v_tropa_key;
            IF v_tropa_disp < v_cantidad THEN
                RAISE EXCEPTION 'No hay suficientes tropas de tipo %', v_tropa_key;
            END IF;

            -- Get stats
            SELECT velocidad, capacidad INTO v_tropas_config FROM public.configuracion_tropas WHERE id = v_tropa_key;

            -- Update min speed
            IF v_tropas_config.velocidad < v_velocidad_min THEN
                v_velocidad_min := v_tropas_config.velocidad;
            END IF;

            -- Update capacity
            v_capacidad_total := v_capacidad_total + (v_tropas_config.capacidad * v_cantidad);

            -- Deduct troops (Move them out of base)
            UPDATE public.tropas SET cantidad = cantidad - v_cantidad WHERE propiedad_id = p_origen_id AND tropa_id = v_tropa_key;
        END IF;
    END LOOP;

    -- Calculate Time
    -- Formula placeholder: Distance / Speed * Constant
    v_tiempo_segundos := (v_distancia / GREATEST(v_velocidad_min, 1) * 3600)::int;
    v_llegada := now() + (v_tiempo_segundos || ' seconds')::interval;

    -- Validate Cargo
    -- Assume 1 resource unit = 1 weight for now
    v_peso_recursos := (COALESCE((p_recursos->>'armas')::int, 0) +
                        COALESCE((p_recursos->>'municion')::int, 0) +
                        COALESCE((p_recursos->>'alcohol')::int, 0) +
                        COALESCE((p_recursos->>'dolares')::int, 0));

    IF v_peso_recursos > v_capacidad_total THEN
         RAISE EXCEPTION 'Capacidad de carga excedida.';
    END IF;

    -- Deduct Resources
    IF (p_recursos->>'armas')::int > 0 THEN
        UPDATE public.propiedades SET recursos_armas = recursos_armas - (p_recursos->>'armas')::int WHERE id = p_origen_id;
    END IF;
    IF (p_recursos->>'municion')::int > 0 THEN
        UPDATE public.propiedades SET recursos_municion = recursos_municion - (p_recursos->>'municion')::int WHERE id = p_origen_id;
    END IF;
    -- etc...

    -- Create Movement
    INSERT INTO public.movimientos_mapa (
        perfil_id, propiedad_origen_id, destino_x, destino_y, destino_z, tipo_mision, tropas, recursos, salida, llegada
    ) VALUES (
        v_perfil_id, p_origen_id, p_destino_x, p_destino_y, p_destino_z, p_mision, p_tropas, p_recursos, now(), v_llegada
    );

    RETURN json_build_object('success', true, 'llegada', v_llegada);
END;
$$;

COMMIT;
