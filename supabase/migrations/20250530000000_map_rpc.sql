-- Function to get map tiles for a specific city and district
CREATE OR REPLACE FUNCTION public.get_map_tiles(
    p_ciudad INTEGER,
    p_barrio INTEGER
)
RETURNS TABLE (
    propiedad_id UUID,
    coordenada_edificio INTEGER,
    usuario_id UUID,
    nombre_usuario TEXT,
    nombre_familia TEXT,
    etiqueta_familia TEXT,
    puntos REAL,
    es_propia BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id AS propiedad_id,
        p.coordenada_edificio,
        p.usuario_id,
        u.nombre_usuario,
        f.nombre AS nombre_familia,
        f.etiqueta AS etiqueta_familia,
        COALESCE(pu.puntos_totales, 0) AS puntos,
        (p.usuario_id = auth.uid()) AS es_propia
    FROM
        public.propiedad p
    JOIN
        public.usuario u ON p.usuario_id = u.id
    LEFT JOIN
        public.miembro_familia mf ON u.id = mf.usuario_id
    LEFT JOIN
        public.familia f ON mf.familia_id = f.id
    LEFT JOIN
        public.puntuacion_usuario pu ON u.id = pu.usuario_id
    WHERE
        p.coordenada_ciudad = p_ciudad
        AND p.coordenada_barrio = p_barrio;
END;
$$;
