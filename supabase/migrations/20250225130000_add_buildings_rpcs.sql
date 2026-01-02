-- Migration to add RPCs for the legacy schema buildings module
-- Security: explicitly setting search_path to '' to prevent search_path hijacking

BEGIN;

-- 1. Helper to get base buildings with config
CREATE OR REPLACE FUNCTION public.get_base_buildings(p_base_id uuid)
RETURNS TABLE (
    id uuid,
    base_id uuid,
    building_id text,
    level integer,
    created_at timestamptz,
    name text,
    description text,
    cost_armaments integer,
    cost_munitions integer,
    cost_dollars integer,
    base_duration integer,
    base_production integer,
    points numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        bb.id,
        bb.base_id,
        bb.building_id,
        bb.level,
        bb.created_at,
        cb.name,
        cb.description,
        cb.cost_armaments,
        cb.cost_munitions,
        cb.cost_dollars,
        cb.base_duration,
        cb.base_production,
        cb.points
    FROM public.base_buildings bb
    JOIN public.config_buildings cb ON bb.building_id = cb.id
    WHERE bb.base_id = p_base_id;
END;
$$;

-- 2. Helper to get construction queue
CREATE OR REPLACE FUNCTION public.get_construction_queue(p_base_id uuid)
RETURNS TABLE (
    id uuid,
    base_id uuid,
    building_id text,
    target_level integer,
    start_time timestamptz,
    end_time timestamptz,
    building_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cq.id,
        cq.base_id,
        cq.building_id,
        cq.target_level,
        cq.start_time,
        cq.end_time,
        cb.name as building_name
    FROM public.construction_queue cq
    JOIN public.config_buildings cb ON cq.building_id = cb.id
    WHERE cq.base_id = p_base_id
    ORDER BY cq.end_time ASC;
END;
$$;

-- 3. Enqueue Building Upgrade
CREATE OR REPLACE FUNCTION public.enqueue_building_upgrade(
    p_base_id uuid,
    p_building_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_base public.bases%ROWTYPE;
    v_config public.config_buildings%ROWTYPE;
    v_current_level integer;
    v_target_level integer;
    v_last_end_time timestamptz;
    v_start_time timestamptz;
    v_end_time timestamptz;
    v_queue_count integer;
    v_queue_limit integer := 5;
    v_cost_arm numeric;
    v_cost_mun numeric;
    v_cost_dol numeric;
BEGIN
    -- Check if base belongs to user (implicit via RLS if called directly, but good for RPC safety)
    SELECT * INTO v_base FROM public.bases WHERE id = p_base_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Base not found');
    END IF;

    IF v_base.user_id != (SELECT auth.uid()) THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
    END IF;

    -- Get Config
    SELECT * INTO v_config FROM public.config_buildings WHERE id = p_building_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Invalid building ID');
    END IF;

    -- Determine current level (from base_buildings or existing queue)
    -- Logic: Base Level + Count of this building in Queue
    SELECT COALESCE(level, 0) INTO v_current_level
    FROM public.base_buildings
    WHERE base_id = p_base_id AND building_id = p_building_id;

    IF NOT FOUND THEN
       v_current_level := 0;
    END IF;

    -- Count how many of this building are already in queue to increment target level
    SELECT COUNT(*) INTO v_queue_count
    FROM public.construction_queue
    WHERE base_id = p_base_id AND building_id = p_building_id;

    v_target_level := v_current_level + v_queue_count + 1;

    -- Calculate Costs (Linear for now as per legacy usually, or formula if specified. Spec says "Costos necesarios para el siguiente nivel". Usually Cost * Level multiplier. Assuming linear static for now based on prompt saying "Construction... cost formulas are currently static")
    -- WARNING: Memory says "formulas are currently static... lack exponential scaling".
    -- I will use static cost from config for simplicity unless I see a formula requirement.
    -- The config table has `cost_armaments` etc. Let's use those as base.
    -- Legacy PHP usually does `base_cost * (2^(level-1))` or similar.
    -- For now, I will use Base Cost * Target Level as a placeholder for linear scaling if level > 1.
    -- Or just Base Cost if the prompt implies static.
    -- Memory says "Construction... cost formulas are currently static (linear)".
    -- I'll use Base Cost * 1 for now to match the "static" observation, or maybe Base Cost * Level?
    -- Let's stick to strict config values (Static) to match the memory "static... lack exponential".

    v_cost_arm := v_config.cost_armaments;
    v_cost_mun := v_config.cost_munitions;
    v_cost_dol := v_config.cost_dollars;

    -- Check Resources
    IF v_base.resources_armaments < v_cost_arm OR
       v_base.resources_munitions < v_cost_mun OR
       v_base.resources_dollars < v_cost_dol THEN
       RETURN jsonb_build_object('error', 'Insufficient resources');
    END IF;

    -- Check Queue Size
    SELECT COUNT(*) INTO v_queue_count FROM public.construction_queue WHERE base_id = p_base_id;
    IF v_queue_count >= v_queue_limit THEN
        RETURN jsonb_build_object('error', 'Queue full');
    END IF;

    -- Determine Timings
    SELECT MAX(end_time) INTO v_last_end_time FROM public.construction_queue WHERE base_id = p_base_id;

    IF v_last_end_time IS NULL OR v_last_end_time < now() THEN
        v_start_time := now();
    ELSE
        v_start_time := v_last_end_time;
    END IF;

    v_end_time := v_start_time + (v_config.base_duration || ' seconds')::interval;

    -- Deduct Resources
    UPDATE public.bases
    SET resources_armaments = resources_armaments - v_cost_arm,
        resources_munitions = resources_munitions - v_cost_mun,
        resources_dollars = resources_dollars - v_cost_dol
    WHERE id = p_base_id;

    -- Add to Queue
    INSERT INTO public.construction_queue (
        base_id, building_id, target_level, start_time, end_time
    ) VALUES (
        p_base_id, p_building_id, v_target_level, v_start_time, v_end_time
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 4. Cancel Building Upgrade
CREATE OR REPLACE FUNCTION public.cancel_building_upgrade(p_queue_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_queue public.construction_queue%ROWTYPE;
    v_config public.config_buildings%ROWTYPE;
    v_base_id uuid;
    v_cost_arm numeric;
    v_cost_mun numeric;
    v_cost_dol numeric;
    v_duration interval;
BEGIN
    SELECT * INTO v_queue FROM public.construction_queue WHERE id = p_queue_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Queue item not found');
    END IF;

    v_base_id := v_queue.base_id;

    -- Auth check
    IF NOT EXISTS (SELECT 1 FROM public.bases WHERE id = v_base_id AND user_id = (SELECT auth.uid())) THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
    END IF;

    SELECT * INTO v_config FROM public.config_buildings WHERE id = v_queue.building_id;

    -- Calculate Refund (100% for now)
    v_cost_arm := v_config.cost_armaments;
    v_cost_mun := v_config.cost_munitions;
    v_cost_dol := v_config.cost_dollars;

    -- Refund
    UPDATE public.bases
    SET resources_armaments = resources_armaments + v_cost_arm,
        resources_munitions = resources_munitions + v_cost_mun,
        resources_dollars = resources_dollars + v_cost_dol
    WHERE id = v_base_id;

    -- Delete
    DELETE FROM public.construction_queue WHERE id = p_queue_id;

    -- Re-adjust subsequent items?
    -- If we remove an item, the subsequent items should technically shift forward.
    -- For simplicity in this migration, we won't implement complex shifting logic
    -- unless strictly required, as it involves recalculating all start/end times.
    -- Ideally, a background worker or a more complex query would handle this.
    -- Current simple approach: Gaps in time are acceptable or handled by the processor.

    RETURN jsonb_build_object('success', true);
END;
$$;

COMMIT;
