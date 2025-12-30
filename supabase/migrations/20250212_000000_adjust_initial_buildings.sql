CREATE OR REPLACE FUNCTION public.crear_propiedad_inicial(p_nombre text, p_ciudad integer, p_barrio integer, p_edificio integer)
RETURNS json AS $$
DECLARE
    v_propiedad_id uuid;
BEGIN
    -- Verificar si el usuario ya tiene una propiedad
    IF EXISTS (SELECT 1 FROM public.propiedad WHERE usuario_id = auth.uid()) THEN
        RETURN json_build_object('error', 'El usuario ya tiene una propiedad.');
    END IF;

    -- Verificar unicidad de coordenadas
    IF EXISTS (SELECT 1 FROM public.propiedad WHERE coordenada_ciudad = p_ciudad AND coordenada_barrio = p_barrio AND coordenada_edificio = p_edificio) THEN
        RETURN json_build_object('error', 'Las coordenadas ya están ocupadas.');
    END IF;

    -- Insertar la nueva propiedad
    INSERT INTO public.propiedad (usuario_id, nombre, coordenada_ciudad, coordenada_barrio, coordenada_edificio, armas, municion, alcohol, dolares, ultima_recogida_recursos)
    VALUES (auth.uid(), p_nombre, p_ciudad, p_barrio, p_edificio, 500, 500, 500, 500, now())
    RETURNING id INTO v_propiedad_id;

    -- Insertar habitaciones iniciales
    INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel)
    VALUES
        (v_propiedad_id, 'oficina_del_jefe', 1),
        (v_propiedad_id, 'escuela_especializacion', 1),
        (v_propiedad_id, 'armeria', 1),
        (v_propiedad_id, 'deposito_de_municion', 1),
        (v_propiedad_id, 'cerveceria', 1),
        (v_propiedad_id, 'taberna', 1),
        (v_propiedad_id, 'campo_de_entrenamiento', 1);

    -- Actualizar el estado del primer login del usuario
    UPDATE public.usuario SET primer_login = true WHERE id = auth.uid();

    RETURN json_build_object('success', true, 'propiedad_id', v_propiedad_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
