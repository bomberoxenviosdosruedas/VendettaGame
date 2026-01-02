-- Phase 1: RLS Optimization
-- Updating policies to use (SELECT auth.uid()) for better performance caching

-- public.usuario
DROP POLICY IF EXISTS "modificacion_propia" ON public.usuario;
CREATE POLICY "modificacion_propia" ON public.usuario FOR UPDATE USING ((SELECT auth.uid()) = id);

-- public.propiedad
DROP POLICY IF EXISTS "modificacion_dueno" ON public.propiedad;
CREATE POLICY "modificacion_dueno" ON public.propiedad FOR UPDATE USING (usuario_id = (SELECT auth.uid()));

-- public.cola_construccion
DROP POLICY IF EXISTS "ver_propias_construccion" ON public.cola_construccion;
CREATE POLICY "ver_propias_construccion" ON public.cola_construccion FOR SELECT USING (EXISTS (SELECT 1 FROM public.propiedad WHERE id = cola_construccion.propiedad_id AND usuario_id = (SELECT auth.uid())));

-- public.cola_investigacion
DROP POLICY IF EXISTS "ver_propias_investigacion" ON public.cola_investigacion;
CREATE POLICY "ver_propias_investigacion" ON public.cola_investigacion FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- public.cola_reclutamiento
DROP POLICY IF EXISTS "ver_propias_reclutamiento" ON public.cola_reclutamiento;
CREATE POLICY "ver_propias_reclutamiento" ON public.cola_reclutamiento FOR SELECT USING (EXISTS (SELECT 1 FROM public.propiedad WHERE id = cola_reclutamiento.propiedad_id AND usuario_id = (SELECT auth.uid())));

-- public.cola_misiones
DROP POLICY IF EXISTS "ver_propias_misiones" ON public.cola_misiones;
CREATE POLICY "ver_propias_misiones" ON public.cola_misiones FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- public.mensaje
DROP POLICY IF EXISTS "ver_mis_mensajes" ON public.mensaje;
CREATE POLICY "ver_mis_mensajes" ON public.mensaje FOR SELECT USING (remitente_id = (SELECT auth.uid()) OR destinatario_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "enviar_mensaje" ON public.mensaje;
CREATE POLICY "enviar_mensaje" ON public.mensaje FOR INSERT WITH CHECK ((SELECT auth.uid()) = remitente_id);

-- public.informe_batalla
DROP POLICY IF EXISTS "ver_participantes_batalla" ON public.informe_batalla;
CREATE POLICY "ver_participantes_batalla" ON public.informe_batalla FOR SELECT USING (atacante_id = (SELECT auth.uid()) OR defensor_id = (SELECT auth.uid()));

-- public.informe_espionaje
DROP POLICY IF EXISTS "ver_participantes_espionaje" ON public.informe_espionaje;
CREATE POLICY "ver_participantes_espionaje" ON public.informe_espionaje FOR SELECT USING (atacante_id = (SELECT auth.uid()) OR defensor_id = (SELECT auth.uid()));

-- public.familia
DROP POLICY IF EXISTS "gestion_lideres" ON public.familia;
CREATE POLICY "gestion_lideres" ON public.familia FOR UPDATE USING (EXISTS (SELECT 1 FROM public.miembro_familia WHERE familia_id = id AND usuario_id = (SELECT auth.uid()) AND rol IN ('lider', 'capitan')));

-- public.historial_acceso
DROP POLICY IF EXISTS "ver_propio_historial" ON public.historial_acceso;
CREATE POLICY "ver_propio_historial" ON public.historial_acceso FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- public.puntuacion_usuario
DROP POLICY IF EXISTS "ver_propia_puntuacion" ON public.puntuacion_usuario;
CREATE POLICY "ver_propia_puntuacion" ON public.puntuacion_usuario FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- public.errores_configuracion
DROP POLICY IF EXISTS "ver_propios_errores" ON public.errores_configuracion;
CREATE POLICY "ver_propios_errores" ON public.errores_configuracion FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- public.habitacion_usuario
DROP POLICY IF EXISTS "ver_propias_habitaciones" ON public.habitacion_usuario;
CREATE POLICY "ver_propias_habitaciones" ON public.habitacion_usuario FOR SELECT USING (EXISTS (SELECT 1 FROM public.propiedad WHERE id = habitacion_usuario.propiedad_id AND usuario_id = (SELECT auth.uid())));

-- public.tropa_propiedad
DROP POLICY IF EXISTS "ver_propias_tropas" ON public.tropa_propiedad;
CREATE POLICY "ver_propias_tropas" ON public.tropa_propiedad FOR SELECT USING (EXISTS (SELECT 1 FROM public.propiedad WHERE id = tropa_propiedad.propiedad_id AND usuario_id = (SELECT auth.uid())));

-- public.tropa_seguridad_propiedad
DROP POLICY IF EXISTS "ver_propias_tropas_seguridad" ON public.tropa_seguridad_propiedad;
CREATE POLICY "ver_propias_tropas_seguridad" ON public.tropa_seguridad_propiedad FOR SELECT USING (EXISTS (SELECT 1 FROM public.propiedad WHERE id = tropa_seguridad_propiedad.propiedad_id AND usuario_id = (SELECT auth.uid())));

-- public.entrenamiento_usuario
DROP POLICY IF EXISTS "ver_propios_entrenamientos" ON public.entrenamiento_usuario;
CREATE POLICY "ver_propios_entrenamientos" ON public.entrenamiento_usuario FOR SELECT USING (usuario_id = (SELECT auth.uid()));

-- public.invitacion_familia
DROP POLICY IF EXISTS "ver_propias_invitaciones" ON public.invitacion_familia;
CREATE POLICY "ver_propias_invitaciones" ON public.invitacion_familia FOR SELECT USING (usuario_id = (SELECT auth.uid()) OR EXISTS (SELECT 1 FROM public.miembro_familia WHERE familia_id = invitacion_familia.familia_id AND usuario_id = (SELECT auth.uid()) AND rol IN ('lider', 'capitan')));

-- public.anuncio_familia
DROP POLICY IF EXISTS "ver_anuncios_familia" ON public.anuncio_familia;
CREATE POLICY "ver_anuncios_familia" ON public.anuncio_familia FOR SELECT USING (EXISTS (SELECT 1 FROM public.miembro_familia WHERE familia_id = anuncio_familia.familia_id AND usuario_id = (SELECT auth.uid())));

-- public.ataque_entrante
DROP POLICY IF EXISTS "ver_ataques_entrantes" ON public.ataque_entrante;
CREATE POLICY "ver_ataques_entrantes" ON public.ataque_entrante FOR SELECT USING (defensor_id = (SELECT auth.uid()));

-- Phase 2: Index Creation
-- Creating B-Tree indices for unindexed foreign keys

CREATE INDEX IF NOT EXISTS idx_anuncio_familia_autor_id ON public.anuncio_familia (autor_id);
CREATE INDEX IF NOT EXISTS idx_anuncio_familia_familia_id ON public.anuncio_familia (familia_id);

CREATE INDEX IF NOT EXISTS idx_ataque_entrante_atacante_id ON public.ataque_entrante (atacante_id);
CREATE INDEX IF NOT EXISTS idx_ataque_entrante_defensor_id ON public.ataque_entrante (defensor_id);
CREATE INDEX IF NOT EXISTS idx_ataque_entrante_mision_id ON public.ataque_entrante (mision_id);

CREATE INDEX IF NOT EXISTS idx_cola_construccion_habitacion_id ON public.cola_construccion (habitacion_id);
CREATE INDEX IF NOT EXISTS idx_cola_construccion_propiedad_id ON public.cola_construccion (propiedad_id);

CREATE INDEX IF NOT EXISTS idx_cola_investigacion_entrenamiento_id ON public.cola_investigacion (entrenamiento_id);
CREATE INDEX IF NOT EXISTS idx_cola_investigacion_usuario_id ON public.cola_investigacion (usuario_id);

CREATE INDEX IF NOT EXISTS idx_cola_misiones_propiedad_origen_id ON public.cola_misiones (propiedad_origen_id);
CREATE INDEX IF NOT EXISTS idx_cola_misiones_usuario_id ON public.cola_misiones (usuario_id);

CREATE INDEX IF NOT EXISTS idx_cola_reclutamiento_tropa_id ON public.cola_reclutamiento (tropa_id);

CREATE INDEX IF NOT EXISTS idx_entrenamiento_usuario_entrenamiento_id ON public.entrenamiento_usuario (entrenamiento_id);

CREATE INDEX IF NOT EXISTS idx_habitacion_usuario_habitacion_id ON public.habitacion_usuario (habitacion_id);

CREATE INDEX IF NOT EXISTS idx_historial_acceso_usuario_id ON public.historial_acceso (usuario_id);

CREATE INDEX IF NOT EXISTS idx_informe_batalla_atacante_id ON public.informe_batalla (atacante_id);
CREATE INDEX IF NOT EXISTS idx_informe_batalla_defensor_id ON public.informe_batalla (defensor_id);

CREATE INDEX IF NOT EXISTS idx_informe_espionaje_atacante_id ON public.informe_espionaje (atacante_id);
CREATE INDEX IF NOT EXISTS idx_informe_espionaje_defensor_id ON public.informe_espionaje (defensor_id);

CREATE INDEX IF NOT EXISTS idx_invitacion_familia_usuario_id ON public.invitacion_familia (usuario_id);

CREATE INDEX IF NOT EXISTS idx_mensaje_destinatario_id ON public.mensaje (destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensaje_informe_batalla_id ON public.mensaje (informe_batalla_id);
CREATE INDEX IF NOT EXISTS idx_mensaje_informe_espionaje_id ON public.mensaje (informe_espionaje_id);
CREATE INDEX IF NOT EXISTS idx_mensaje_remitente_id ON public.mensaje (remitente_id);

CREATE INDEX IF NOT EXISTS idx_miembro_familia_familia_id ON public.miembro_familia (familia_id);

CREATE INDEX IF NOT EXISTS idx_propiedad_usuario_id ON public.propiedad (usuario_id);

CREATE INDEX IF NOT EXISTS idx_requisito_entrenamiento_entrenamiento_id ON public.requisito_entrenamiento (entrenamiento_id);
CREATE INDEX IF NOT EXISTS idx_requisito_entrenamiento_entrenamiento_requerido_id ON public.requisito_entrenamiento (entrenamiento_requerido_id);

CREATE INDEX IF NOT EXISTS idx_requisito_habitacion_habitacion_id ON public.requisito_habitacion (habitacion_id);
CREATE INDEX IF NOT EXISTS idx_requisito_habitacion_habitacion_requerida_id ON public.requisito_habitacion (habitacion_requerida_id);

CREATE INDEX IF NOT EXISTS idx_tropa_bonus_contrincante_tropa_atacante_id ON public.tropa_bonus_contrincante (tropa_atacante_id);
CREATE INDEX IF NOT EXISTS idx_tropa_bonus_contrincante_tropa_defensora_id ON public.tropa_bonus_contrincante (tropa_defensora_id);

CREATE INDEX IF NOT EXISTS idx_tropa_propiedad_tropa_id ON public.tropa_propiedad (tropa_id);

CREATE INDEX IF NOT EXISTS idx_tropa_seguridad_propiedad_tropa_id ON public.tropa_seguridad_propiedad (tropa_id);
