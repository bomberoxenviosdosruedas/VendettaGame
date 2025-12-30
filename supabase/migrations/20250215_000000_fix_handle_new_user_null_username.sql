CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuario (id, email, nombre_usuario)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      SPLIT_PART(new.email, '@', 1) || '_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)
    )
  );
  INSERT INTO public.puntuacion_usuario (usuario_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
