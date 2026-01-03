-- Migration: Restore Alliance RPCs and RLS Fixes

BEGIN;

-- -----------------------------------------------------------------------------
-- Fix RLS for requests (Allow leaders to see incoming requests)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Ver solicitudes de mi alianza" ON public.solicitudes_alianza;
CREATE POLICY "Ver solicitudes de mi alianza" ON public.solicitudes_alianza
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.miembros_alianza
        WHERE miembros_alianza.perfil_id = (SELECT auth.uid())
        AND miembros_alianza.alianza_id = solicitudes_alianza.alianza_id
        AND miembros_alianza.rango IN ('Lider', 'Colider')
    )
);

-- -----------------------------------------------------------------------------
-- RPC: Crear Alianza
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crear_alianza(
    p_nombre text,
    p_etiqueta text,
    p_descripcion text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_alianza_id uuid;
    v_perfil_id uuid;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    -- Check if user is already in an alliance
    IF EXISTS (SELECT 1 FROM public.miembros_alianza WHERE perfil_id = v_perfil_id) THEN
        RAISE EXCEPTION 'El usuario ya pertenece a una alianza.';
    END IF;

    -- Create Alliance
    INSERT INTO public.alianzas (nombre, etiqueta, descripcion)
    VALUES (p_nombre, p_etiqueta, p_descripcion)
    RETURNING id INTO v_alianza_id;

    -- Add Creator as Leader
    INSERT INTO public.miembros_alianza (alianza_id, perfil_id, rango)
    VALUES (v_alianza_id, v_perfil_id, 'Lider');

    RETURN v_alianza_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Solicitar Ingreso
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.solicitar_ingreso_alianza(
    p_alianza_id uuid,
    p_mensaje text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    IF EXISTS (SELECT 1 FROM public.miembros_alianza WHERE perfil_id = v_perfil_id) THEN
        RAISE EXCEPTION 'Ya perteneces a una alianza.';
    END IF;

    IF EXISTS (SELECT 1 FROM public.solicitudes_alianza WHERE perfil_id = v_perfil_id AND alianza_id = p_alianza_id) THEN
        RAISE EXCEPTION 'Ya has enviado una solicitud a esta alianza.';
    END IF;

    INSERT INTO public.solicitudes_alianza (perfil_id, alianza_id, mensaje)
    VALUES (v_perfil_id, p_alianza_id, p_mensaje);
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Aceptar Solicitud
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.aceptar_solicitud_alianza(
    p_solicitud_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid; -- The user accepting (must be leader/coleader)
    v_solicitante_id uuid;
    v_alianza_id uuid;
    v_rango_actor text;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    -- Get request details
    SELECT perfil_id, alianza_id INTO v_solicitante_id, v_alianza_id
    FROM public.solicitudes_alianza
    WHERE id = p_solicitud_id;

    IF v_solicitante_id IS NULL THEN
        RAISE EXCEPTION 'Solicitud no encontrada.';
    END IF;

    -- Check permissions of actor
    SELECT rango INTO v_rango_actor
    FROM public.miembros_alianza
    WHERE perfil_id = v_perfil_id AND alianza_id = v_alianza_id;

    IF v_rango_actor NOT IN ('Lider', 'Colider') THEN
        RAISE EXCEPTION 'No tienes permisos para aceptar solicitudes.';
    END IF;

    -- Check if applicant is already in an alliance (race condition)
    IF EXISTS (SELECT 1 FROM public.miembros_alianza WHERE perfil_id = v_solicitante_id) THEN
        -- Just delete request
        DELETE FROM public.solicitudes_alianza WHERE id = p_solicitud_id;
        RAISE EXCEPTION 'El usuario ya pertenece a otra alianza.';
    END IF;

    -- Add member
    INSERT INTO public.miembros_alianza (alianza_id, perfil_id, rango)
    VALUES (v_alianza_id, v_solicitante_id, 'Miembro');

    -- Delete request
    DELETE FROM public.solicitudes_alianza WHERE id = p_solicitud_id;

    -- Also delete other requests by this user to avoid stale requests
    DELETE FROM public.solicitudes_alianza WHERE perfil_id = v_solicitante_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Rechazar Solicitud
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.rechazar_solicitud_alianza(
    p_solicitud_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_alianza_id uuid;
    v_rango_actor text;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    SELECT alianza_id INTO v_alianza_id
    FROM public.solicitudes_alianza
    WHERE id = p_solicitud_id;

    IF v_alianza_id IS NULL THEN
        RAISE EXCEPTION 'Solicitud no encontrada.';
    END IF;

    SELECT rango INTO v_rango_actor
    FROM public.miembros_alianza
    WHERE perfil_id = v_perfil_id AND alianza_id = v_alianza_id;

    IF v_rango_actor NOT IN ('Lider', 'Colider') THEN
        RAISE EXCEPTION 'No tienes permisos.';
    END IF;

    DELETE FROM public.solicitudes_alianza WHERE id = p_solicitud_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Salir Alianza
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.salir_alianza()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_alianza_id uuid;
    v_rango text;
    v_num_miembros integer;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    SELECT alianza_id, rango INTO v_alianza_id, v_rango
    FROM public.miembros_alianza
    WHERE perfil_id = v_perfil_id;

    IF v_alianza_id IS NULL THEN
        RAISE EXCEPTION 'No perteneces a ninguna alianza.';
    END IF;

    IF v_rango = 'Lider' THEN
        -- Check if there are other members
        SELECT count(*) INTO v_num_miembros FROM public.miembros_alianza WHERE alianza_id = v_alianza_id;
        IF v_num_miembros > 1 THEN
             RAISE EXCEPTION 'El líder no puede salir sin delegar el liderazgo o disolver la alianza (opción no implementada aún, debe expulsar a todos o delegar).';
        ELSE
             -- Disband if alone
             DELETE FROM public.alianzas WHERE id = v_alianza_id;
             RETURN;
        END IF;
    END IF;

    DELETE FROM public.miembros_alianza WHERE perfil_id = v_perfil_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Expulsar Miembro
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.expulsar_miembro(
    p_miembro_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_perfil_id uuid;
    v_alianza_id uuid;
    v_rango_actor text;
    v_rango_target text;
    v_target_alianza_id uuid;
BEGIN
    v_perfil_id := (SELECT auth.uid());

    SELECT alianza_id, rango INTO v_alianza_id, v_rango_actor
    FROM public.miembros_alianza
    WHERE perfil_id = v_perfil_id;

    SELECT alianza_id, rango INTO v_target_alianza_id, v_rango_target
    FROM public.miembros_alianza
    WHERE perfil_id = p_miembro_id;

    IF v_alianza_id IS NULL OR v_target_alianza_id IS NULL OR v_alianza_id != v_target_alianza_id THEN
        RAISE EXCEPTION 'Miembro no encontrado en tu alianza.';
    END IF;

    IF v_rango_actor NOT IN ('Lider', 'Colider') THEN
        RAISE EXCEPTION 'No tienes permisos.';
    END IF;

    IF v_rango_target = 'Lider' THEN
        RAISE EXCEPTION 'No puedes expulsar al líder.';
    END IF;

    IF v_rango_actor = 'Colider' AND v_rango_target = 'Colider' THEN
         RAISE EXCEPTION 'Un colíder no puede expulsar a otro colíder.';
    END IF;

    DELETE FROM public.miembros_alianza WHERE perfil_id = p_miembro_id;
END;
$$;

COMMIT;
