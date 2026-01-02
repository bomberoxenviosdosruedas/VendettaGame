-- Migration to add RPCs for Building Details and Production Projection

BEGIN;

-- 1. Get Production Projection
-- Calculates potential production for a building type for the next X levels
-- Formula: Currently Linear (Base * Level) as placeholder for Legacy Logic.
-- Can be updated to Exponential later without changing application code.
CREATE OR REPLACE FUNCTION public.get_building_production_projection(
    p_base_id uuid,
    p_building_id text,
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    level integer,
    production_hourly numeric,
    resource_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_config public.config_buildings%ROWTYPE;
    v_current_level integer;
    v_start_level integer;
    v_base_prod integer;
    v_resource_type text; -- Derived from ID or config? Config doesn't have type col in provided schema, but prompt mentions inference.
    -- Wait, looking at legacy schema provided in 'recreate_legacy_schema.sql':
    -- config_buildings columns: id, name, description, ..., base_production, points.
    -- NO explicit 'resource_type' column.
    -- The prompt says: "Detecta el tipo de recurso basado en el nombre del edificio (armeria -> armas, taberna -> dolares...)"
BEGIN
    SELECT * INTO v_config FROM public.config_buildings WHERE id = p_building_id;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Infer Resource Type logic (Hardcoded mapping for legacy parity)
    IF p_building_id = 'armeria' THEN v_resource_type := 'armas';
    ELSIF p_building_id = 'municion' THEN v_resource_type := 'municion';
    ELSIF p_building_id = 'cerveceria' THEN v_resource_type := 'alcohol';
    ELSIF p_building_id = 'taberna' THEN v_resource_type := 'dolares'; -- Production via conversion? Or direct? Prompt says "traficas con Alcohol... beneficio a la caja". Usually produces dollars.
    ELSIF p_building_id = 'contrabando' THEN v_resource_type := 'dolares';
    ELSE v_resource_type := NULL;
    END IF;

    -- If no production, return empty
    IF v_config.base_production <= 0 THEN
        RETURN;
    END IF;

    -- Get Current Level
    SELECT level INTO v_current_level
    FROM public.base_buildings
    WHERE base_id = p_base_id AND building_id = p_building_id;

    v_start_level := COALESCE(v_current_level, 0);

    -- Generate Projection
    FOR i IN 0..p_limit LOOP
        level := v_start_level + i;

        -- Formula: Base * Level (Hourly)
        -- Note: Game uses per-second in backend typically, but prompt says "Hora (Producción total teórica por hora)".
        -- If base_production is per hour? Or per second?
        -- Schema comment says: "base_production integer NOT NULL DEFAULT 0".
        -- Legacy config insert: "armeria... base_production 10". 10 what?
        -- If 10/hour, it's very low. If 10/sec? Too high.
        -- Let's assume the value in DB is "Units per Hour" for the display, or strictly follows legacy units.
        -- Standard OGame/Vendetta clones usually store "Base Production" factor.
        -- Let's assume: production = base_production * level * speed_factor?
        -- For now: simple linear multiplication.

        production_hourly := v_config.base_production * level;
        resource_type := v_resource_type;

        RETURN NEXT;
    END LOOP;
END;
$$;

COMMIT;
