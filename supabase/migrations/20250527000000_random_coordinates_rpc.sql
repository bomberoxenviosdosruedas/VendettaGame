CREATE OR REPLACE FUNCTION public.obtener_coordenada_libre()
RETURNS json AS $$
DECLARE
    v_ciudad int;
    v_barrio int;
    v_edificio int;
    i int;
BEGIN
    FOR i IN 1..20 LOOP
        -- Generar coordenadas aleatorias dentro de los rangos permitidos
        -- Ciudad: 1-50
        -- Barrio: 1-50
        -- Edificio: 1-255
        v_ciudad := floor(random() * 50 + 1)::int;
        v_barrio := floor(random() * 50 + 1)::int;
        v_edificio := floor(random() * 255 + 1)::int;

        -- Verificar si la coordenada está ocupada
        IF NOT EXISTS (
            SELECT 1 FROM public.propiedad
            WHERE coordenada_ciudad = v_ciudad
            AND coordenada_barrio = v_barrio
            AND coordenada_edificio = v_edificio
        ) THEN
            -- Si no existe, retornar la coordenada encontrada
            RETURN json_build_object(
                'ciudad', v_ciudad,
                'barrio', v_barrio,
                'edificio', v_edificio
            );
        END IF;
    END LOOP;

    -- Si tras 20 intentos no se encuentra (altamente improbable con estos rangos), devolver error
    RETURN json_build_object('error', 'No se encontró ubicación libre tras 20 intentos. Por favor intente nuevamente.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
