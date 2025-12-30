-- Migration to enable automatic property creation upon user registration

-- 1. Update crear_propiedad_inicial to handle optional parameters and external calls
-- Note: We add p_usuario_id to allow calling this for a specific user (via trigger) instead of just auth.uid()
CREATE OR REPLACE FUNCTION public.crear_propiedad_inicial(
    p_nombre text DEFAULT NULL,
    p_ciudad integer DEFAULT NULL,
    p_barrio integer DEFAULT NULL,
    p_edificio integer DEFAULT NULL,
    p_usuario_id uuid DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    v_propiedad_id uuid;
    v_usuario_id uuid;
    v_coords json;
    v_ciudad int;
    v_barrio int;
    v_edificio int;
    v_nombre text;
    v_user_name text;
BEGIN
    -- Determinar usuario objetivo: param o sesión
    v_usuario_id := COALESCE(p_usuario_id, auth.uid());

    IF v_usuario_id IS NULL THEN
        RETURN json_build_object('error', 'Usuario no identificado');
    END IF;

    -- Verificar si el usuario ya tiene una propiedad
    IF EXISTS (SELECT 1 FROM public.propiedad WHERE usuario_id = v_usuario_id) THEN
        RETURN json_build_object('error', 'El usuario ya tiene una propiedad.');
    END IF;

    -- Lógica de Coordenadas: Si vienen NULL, buscar libres
    IF p_ciudad IS NULL OR p_barrio IS NULL OR p_edificio IS NULL THEN
        v_coords := public.obtener_coordenada_libre();
        IF v_coords->>'error' IS NOT NULL THEN
            RETURN v_coords; -- Retornar el error de coordenadas
        END IF;

        v_ciudad := (v_coords->>'ciudad')::int;
        v_barrio := (v_coords->>'barrio')::int;
        v_edificio := (v_coords->>'edificio')::int;
    ELSE
        -- Usar las provistas
        v_ciudad := p_ciudad;
        v_barrio := p_barrio;
        v_edificio := p_edificio;

        -- Verificar unicidad de coordenadas provistas
        IF EXISTS (SELECT 1 FROM public.propiedad WHERE coordenada_ciudad = v_ciudad AND coordenada_barrio = v_barrio AND coordenada_edificio = v_edificio) THEN
            RETURN json_build_object('error', 'Las coordenadas ya están ocupadas.');
        END IF;
    END IF;

    -- Lógica de Nombre: Si viene NULL, generar
    IF p_nombre IS NULL OR p_nombre = '' THEN
        -- Intentar obtener nombre del usuario
        SELECT full_name INTO v_user_name FROM public.usuario WHERE id = v_usuario_id;
        v_nombre := 'Base de ' || COALESCE(v_user_name, 'Operaciones');
    ELSE
        v_nombre := p_nombre;
    END IF;

    -- Insertar la nueva propiedad
    INSERT INTO public.propiedad (usuario_id, nombre, coordenada_ciudad, coordenada_barrio, coordenada_edificio, armas, municion, alcohol, dolares, ultima_recogida_recursos)
    VALUES (v_usuario_id, v_nombre, v_ciudad, v_barrio, v_edificio, 500, 500, 500, 500, NOW())
    RETURNING id INTO v_propiedad_id;

    -- Insertar habitaciones iniciales (7 edificios base)
    INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel)
    VALUES
        (v_propiedad_id, 'oficina_del_jefe', 1),
        (v_propiedad_id, 'escuela_especializacion', 1),
        (v_propiedad_id, 'armeria', 1),
        (v_propiedad_id, 'deposito_de_municion', 1),
        (v_propiedad_id, 'cerveceria', 1),
        (v_propiedad_id, 'taberna', 1),
        (v_propiedad_id, 'campo_de_entrenamiento', 1);

    -- Actualizar el estado del primer login del usuario (si aplica)
    UPDATE public.usuario SET primer_login = true WHERE id = v_usuario_id;

    RETURN json_build_object('success', true, 'propiedad_id', v_propiedad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 2. Create Trigger Function to auto-create property
CREATE OR REPLACE FUNCTION public.trigger_crear_propiedad_automatica_fn()
RETURNS TRIGGER AS $$
DECLARE
    v_result json;
BEGIN
    -- Llamar a la función de creación con valores por defecto (NULLs) para que genere randoms
    -- Pasamos NEW.id como el usuario propietario
    v_result := public.crear_propiedad_inicial(
        p_nombre := NULL,
        p_ciudad := NULL,
        p_barrio := NULL,
        p_edificio := NULL,
        p_usuario_id := NEW.id
    );

    -- Opcional: Podríamos loguear errores si falla, pero en un trigger AFTER INSERT
    -- fallar podría revertir la creación del usuario si lanzamos excepción.
    -- Dado que es crítico que tenga propiedad, lanzamos warning si falla, o exception?
    -- Si falla la creación de propiedad, el usuario queda roto. Mejor que falle todo el registro.

    IF v_result->>'error' IS NOT NULL THEN
        RAISE EXCEPTION 'Error creando propiedad inicial: %', v_result->>'error';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 3. Create Trigger on public.usuario
DROP TRIGGER IF EXISTS trigger_crear_propiedad_automatica ON public.usuario;

CREATE TRIGGER trigger_crear_propiedad_automatica
AFTER INSERT ON public.usuario
FOR EACH ROW
EXECUTE FUNCTION public.trigger_crear_propiedad_automatica_fn();
