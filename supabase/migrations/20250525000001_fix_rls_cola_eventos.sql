-- Fix missing RLS policy for cola_eventos_flota
-- This table is internal and should only be accessed by the service_role

CREATE POLICY "service_role_manage_all" ON public.cola_eventos_flota
AS PERMISSIVE FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
