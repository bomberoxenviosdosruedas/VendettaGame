-- Migration: 20250529000000_auto_create_property_trigger.sql
-- Description: Move property creation to handle_new_user trigger to ensure atomicity and robustness.

-- 1. Refactor crear_propiedad_inicial to ensure it handles optional parameters and system execution
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
        -- Intentar obtener nombre del usuario (corrigiendo bug de full_name que no existe en tabla usuario)
        SELECT nombre_usuario INTO v_user_name FROM public.usuario WHERE id = v_usuario_id;
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

-- 2. Update handle_new_user to call crear_propiedad_inicial directly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_result json;
    v_nombre_usuario text;
    v_nombre_propiedad text;
BEGIN
  -- Determine username from metadata or email
  v_nombre_usuario := COALESCE(
      new.raw_user_meta_data->>'full_name',
      SPLIT_PART(new.email, '@', 1) || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
  );

  -- Insert into public.usuario
  INSERT INTO public.usuario (id, email, nombre_usuario)
  VALUES (
    new.id,
    new.email,
    v_nombre_usuario
  );

  -- Insert into public.puntuacion_usuario
  INSERT INTO public.puntuacion_usuario (usuario_id)
  VALUES (new.id);

  -- Create Initial Property
  v_nombre_propiedad := 'Imperio de ' || v_nombre_usuario;

  -- Call helper function
  v_result := public.crear_propiedad_inicial(
      p_nombre := v_nombre_propiedad,
      p_ciudad := NULL, -- Auto-generate
      p_barrio := NULL, -- Auto-generate
      p_edificio := NULL, -- Auto-generate
      p_usuario_id := new.id
  );

  -- Verify success
  IF v_result->>'error' IS NOT NULL THEN
      -- Raise exception to rollback user creation if property creation fails
      RAISE EXCEPTION 'Error auto-creating property: %', v_result->>'error';
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 3. Cleanup: Remove the trigger on public.usuario as it is no longer needed
DROP TRIGGER IF EXISTS trigger_crear_propiedad_automatica ON public.usuario;
DROP FUNCTION IF EXISTS public.trigger_crear_propiedad_automatica_fn();
