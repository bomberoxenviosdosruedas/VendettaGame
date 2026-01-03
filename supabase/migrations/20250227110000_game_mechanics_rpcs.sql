-- Migration: Game Mechanics RPCs (Construction, Resources, Market)

BEGIN;

-- -----------------------------------------------------------------------------
-- RPC: Actualizar Recursos
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.actualizar_recursos(p_propiedad_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_propiedad record;
  v_segundos numeric;
  v_prod_armas numeric := 0;
  v_prod_municion numeric := 0;
  v_prod_alcohol numeric := 0;
  v_prod_dolares numeric := 0;
BEGIN
  -- Lock property for update
  SELECT * INTO v_propiedad FROM public.propiedades WHERE id = p_propiedad_id FOR UPDATE;

  -- Calculate time elapsed
  v_segundos := EXTRACT(EPOCH FROM (now() - v_propiedad.ultima_actualizacion));

  IF v_segundos < 1 THEN
    RETURN; -- Negligible time
  END IF;

  -- Calculate production rates based on buildings
  -- Assuming simple formula: sum(config.produccion_base * nivel)
  -- Note: specific building types produce specific resources.
  -- Oficina/Escuela/etc don't produce.
  -- Armeria -> Armas
  -- Municion -> Municion
  -- Cerveceria -> Alcohol
  -- Contrabando -> Dolares (simplified logic, usually needs alcohol, but here we assume generation)
  -- Taberna -> Dolares

  SELECT
    COALESCE(SUM(CASE WHEN c.id = 'armeria' THEN c.produccion_base * e.nivel ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN c.id = 'municion' THEN c.produccion_base * e.nivel ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN c.id = 'cerveceria' THEN c.produccion_base * e.nivel ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN c.id IN ('taberna', 'contrabando') THEN c.produccion_base * e.nivel ELSE 0 END), 0)
  INTO v_prod_armas, v_prod_municion, v_prod_alcohol, v_prod_dolares
  FROM public.edificios e
  JOIN public.configuracion_edificios c ON e.edificio_id = c.id
  WHERE e.propiedad_id = p_propiedad_id AND e.nivel > 0;

  -- Update resources
  -- Division by 3600 because produccion_base is usually per hour in game configs,
  -- but if it's per second, remove /3600. Legacy usually is per hour.
  -- Checking config data: Armeria base 10. If per hour, that's small.
  -- Let's assume the config values are "per hour".

  UPDATE public.propiedades
  SET
    recursos_armas = recursos_armas + (v_prod_armas * v_segundos / 3600.0),
    recursos_municion = recursos_municion + (v_prod_municion * v_segundos / 3600.0),
    recursos_alcohol = recursos_alcohol + (v_prod_alcohol * v_segundos / 3600.0),
    recursos_dolares = recursos_dolares + (v_prod_dolares * v_segundos / 3600.0),
    ultima_actualizacion = now()
  WHERE id = p_propiedad_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Iniciar Construcción
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.iniciar_construccion(
  p_propiedad_id uuid,
  p_edificio_id text
)
RETURNS json
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
  v_propiedad record;
  v_config record;
  v_queue_count int;
BEGIN
  v_perfil_id := (SELECT auth.uid());

  -- Verify ownership
  SELECT * INTO v_propiedad FROM public.propiedades
  WHERE id = p_propiedad_id AND perfil_id = v_perfil_id;

  IF v_propiedad IS NULL THEN
    RAISE EXCEPTION 'Propiedad no encontrada o no pertenece al usuario.';
  END IF;

  -- Get Config
  SELECT * INTO v_config FROM public.configuracion_edificios WHERE id = p_edificio_id;
  IF v_config IS NULL THEN
    RAISE EXCEPTION 'Edificio no válido.';
  END IF;

  -- Get Current Level
  SELECT COALESCE(nivel, 0) INTO v_nivel_actual
  FROM public.edificios
  WHERE propiedad_id = p_propiedad_id AND edificio_id = p_edificio_id;

  -- Calculate Costs (Linear * Level or Exponential?)
  -- Legacy logic was often Linear for simplicity in some versions, but usually Exponential.
  -- Prompt says "Construction ... cost formulas are currently static (linear)".
  -- We will use Linear scaling for now based on prompt: base * (level + 1)
  -- Or just Base? Prompt says "Formula is currently static (linear)".
  -- Let's use Base * (Level+1) to make it increase.
  v_costo_armas := v_config.costo_armas * (v_nivel_actual + 1);
  v_costo_municion := v_config.costo_municion * (v_nivel_actual + 1);
  v_costo_dolares := v_config.costo_dolares * (v_nivel_actual + 1);
  v_duracion := v_config.duracion_base * (v_nivel_actual + 1);

  -- Check Resources
  IF v_propiedad.recursos_armas < v_costo_armas OR
     v_propiedad.recursos_municion < v_costo_municion OR
     v_propiedad.recursos_dolares < v_costo_dolares THEN
     RETURN json_build_object('error', 'Recursos insuficientes.');
  END IF;

  -- Check Queue Limit
  SELECT count(*) INTO v_queue_count FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id;
  IF v_queue_count >= 5 THEN
    RETURN json_build_object('error', 'Cola de construcción llena (Máx 5).');
  END IF;

  -- Determine Start Time
  SELECT MAX(fin) INTO v_fin_ultimo FROM public.cola_construccion WHERE propiedad_id = p_propiedad_id;
  IF v_fin_ultimo IS NULL OR v_fin_ultimo < now() THEN
    v_fin_ultimo := now();
  END IF;

  -- Deduct Resources
  UPDATE public.propiedades SET
    recursos_armas = recursos_armas - v_costo_armas,
    recursos_municion = recursos_municion - v_costo_municion,
    recursos_dolares = recursos_dolares - v_costo_dolares
  WHERE id = p_propiedad_id;

  -- Add to Queue
  INSERT INTO public.cola_construccion (
    propiedad_id,
    edificio_id,
    nivel_destino,
    inicio,
    fin
  ) VALUES (
    p_propiedad_id,
    p_edificio_id,
    v_nivel_actual + 1,
    v_fin_ultimo,
    v_fin_ultimo + (v_duracion || ' seconds')::interval
  );

  RETURN json_build_object('success', true, 'mensaje', 'Construcción iniciada.');
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Publicar Oferta Mercado
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.publicar_oferta(
    p_recurso text, -- 'armas', 'municion', 'alcohol', 'dolares'
    p_cantidad int,
    p_pide_armas int,
    p_pide_municion int,
    p_pide_dolares int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_propiedad_id uuid;
    v_recurso_actual numeric;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    -- Find main property (simplified: taking the first one found for the user)
    SELECT id INTO v_propiedad_id FROM public.propiedades WHERE perfil_id = v_perfil_id LIMIT 1;

    IF v_propiedad_id IS NULL THEN
        RAISE EXCEPTION 'No tienes una propiedad base.';
    END IF;

    -- Validate Inputs
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'Cantidad debe ser positiva.';
    END IF;

    IF p_pide_armas < 0 OR p_pide_municion < 0 OR p_pide_dolares < 0 THEN
        RAISE EXCEPTION 'Los costos no pueden ser negativos.';
    END IF;

    IF p_pide_armas = 0 AND p_pide_municion = 0 AND p_pide_dolares = 0 THEN
        RAISE EXCEPTION 'Debes pedir algo a cambio.';
    END IF;

    -- Check Resources and Deduct
    EXECUTE format('SELECT recursos_%I FROM public.propiedades WHERE id = $1', p_recurso)
    INTO v_recurso_actual USING v_propiedad_id;

    IF v_recurso_actual < p_cantidad THEN
        RAISE EXCEPTION 'No tienes suficientes recursos.';
    END IF;

    EXECUTE format('UPDATE public.propiedades SET recursos_%I = recursos_%I - $1 WHERE id = $2', p_recurso, p_recurso)
    USING p_cantidad, v_propiedad_id;

    -- Insert Offer
    INSERT INTO public.ofertas_mercado (
        vendedor_id, recurso, cantidad, pide_armas, pide_municion, pide_dolares, expira_en
    ) VALUES (
        v_perfil_id, p_recurso, p_cantidad, p_pide_armas, p_pide_municion, p_pide_dolares, now() + interval '7 days'
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Cancelar Oferta
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.cancelar_oferta(p_oferta_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_oferta record;
    v_propiedad_id uuid;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    SELECT * INTO v_oferta FROM public.ofertas_mercado WHERE id = p_oferta_id;

    IF v_oferta IS NULL THEN
        RAISE EXCEPTION 'Oferta no encontrada.';
    END IF;

    IF v_oferta.vendedor_id != v_perfil_id THEN
        RAISE EXCEPTION 'No eres el dueño de esta oferta.';
    END IF;

    IF v_oferta.comprador_id IS NOT NULL OR v_oferta.aceptada THEN
        RAISE EXCEPTION 'La oferta ya ha sido vendida.';
    END IF;

    -- Return resources
    SELECT id INTO v_propiedad_id FROM public.propiedades WHERE perfil_id = v_perfil_id LIMIT 1;

    IF v_propiedad_id IS NOT NULL THEN
        EXECUTE format('UPDATE public.propiedades SET recursos_%I = recursos_%I + $1 WHERE id = $2', v_oferta.recurso, v_oferta.recurso)
        USING v_oferta.cantidad, v_propiedad_id;
    END IF;

    DELETE FROM public.ofertas_mercado WHERE id = p_oferta_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Comprar Oferta
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.comprar_oferta(p_oferta_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_comprador_id uuid;
    v_prop_comprador_id uuid;
    v_prop_vendedor_id uuid;
    v_oferta record;
    v_recursos_comprador record;
BEGIN
    v_comprador_id := (SELECT auth.uid());

    -- Lock offer
    SELECT * INTO v_oferta FROM public.ofertas_mercado WHERE id = p_oferta_id FOR UPDATE;

    IF v_oferta IS NULL THEN
        RAISE EXCEPTION 'Oferta no encontrada.';
    END IF;

    IF v_oferta.vendedor_id = v_comprador_id THEN
        RAISE EXCEPTION 'No puedes comprar tu propia oferta.';
    END IF;

    IF v_oferta.aceptada THEN
        RAISE EXCEPTION 'Esta oferta ya fue vendida.';
    END IF;

    -- Get Properties
    SELECT id INTO v_prop_comprador_id FROM public.propiedades WHERE perfil_id = v_comprador_id LIMIT 1;
    SELECT id INTO v_prop_vendedor_id FROM public.propiedades WHERE perfil_id = v_oferta.vendedor_id LIMIT 1;

    IF v_prop_comprador_id IS NULL THEN
        RAISE EXCEPTION 'Necesitas una base para comerciar.';
    END IF;

    -- Check Buyer Resources
    SELECT * INTO v_recursos_comprador FROM public.propiedades WHERE id = v_prop_comprador_id;

    IF v_recursos_comprador.recursos_armas < v_oferta.pide_armas OR
       v_recursos_comprador.recursos_municion < v_oferta.pide_municion OR
       v_recursos_comprador.recursos_dolares < v_oferta.pide_dolares THEN
       RAISE EXCEPTION 'No tienes suficientes recursos para pagar esta oferta.';
    END IF;

    -- Process Transaction

    -- 1. Deduct cost from buyer
    UPDATE public.propiedades SET
        recursos_armas = recursos_armas - v_oferta.pide_armas,
        recursos_municion = recursos_municion - v_oferta.pide_municion,
        recursos_dolares = recursos_dolares - v_oferta.pide_dolares,
        ultima_actualizacion = now()
    WHERE id = v_prop_comprador_id;

    -- 2. Add goods to buyer
    EXECUTE format('UPDATE public.propiedades SET recursos_%I = recursos_%I + $1 WHERE id = $2', v_oferta.recurso, v_oferta.recurso)
    USING v_oferta.cantidad, v_prop_comprador_id;

    -- 3. Add payment to seller
    IF v_prop_vendedor_id IS NOT NULL THEN
        UPDATE public.propiedades SET
            recursos_armas = recursos_armas + v_oferta.pide_armas,
            recursos_municion = recursos_municion + v_oferta.pide_municion,
            recursos_dolares = recursos_dolares + v_oferta.pide_dolares,
            ultima_actualizacion = now()
        WHERE id = v_prop_vendedor_id;
    END IF;

    -- 4. Mark offer as sold
    UPDATE public.ofertas_mercado SET
        aceptada = true,
        comprador_id = v_comprador_id
    WHERE id = p_oferta_id;

    -- Optional: Notify seller (not implemented in this RPC)
END;
$$;

COMMIT;
