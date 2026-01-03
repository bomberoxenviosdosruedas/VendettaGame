-- Migration: Messages RPCs and Policies

BEGIN;

-- -----------------------------------------------------------------------------
-- RPC: Enviar Mensaje
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.enviar_mensaje(
    p_destinatario_nombre text,
    p_asunto text,
    p_cuerpo text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_remitente_id uuid;
    v_destinatario_id uuid;
BEGIN
    v_remitente_id := (SELECT auth.uid());

    -- Find recipient by username
    SELECT id INTO v_destinatario_id
    FROM public.perfiles
    WHERE lower(nombre_usuario) = lower(p_destinatario_nombre);

    IF v_destinatario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario destinatario no encontrado.';
    END IF;

    IF v_remitente_id = v_destinatario_id THEN
        RAISE EXCEPTION 'No puedes enviarte mensajes a ti mismo.';
    END IF;

    INSERT INTO public.mensajes (remitente_id, destinatario_id, asunto, cuerpo)
    VALUES (v_remitente_id, v_destinatario_id, p_asunto, p_cuerpo);
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Borrar Mensaje
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.borrar_mensaje(
    p_mensaje_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    v_user_id := (SELECT auth.uid());

    -- Soft delete: update flag depending on who is deleting
    UPDATE public.mensajes
    SET
        borrado_remitente = CASE WHEN remitente_id = v_user_id THEN true ELSE borrado_remitente END,
        borrado_destinatario = CASE WHEN destinatario_id = v_user_id THEN true ELSE borrado_destinatario END
    WHERE id = p_mensaje_id AND (remitente_id = v_user_id OR destinatario_id = v_user_id);

    -- Hard delete if both deleted? Or Cron job?
    -- For now, soft delete logic is sufficient for user view.
END;
$$;

-- -----------------------------------------------------------------------------
-- RPC: Marcar como Leído
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.leer_mensaje(
    p_mensaje_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    UPDATE public.mensajes
    SET leido = true
    WHERE id = p_mensaje_id AND destinatario_id = (SELECT auth.uid());
END;
$$;

COMMIT;
