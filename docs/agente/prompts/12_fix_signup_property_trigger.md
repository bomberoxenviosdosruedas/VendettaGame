🏗️ ESPECIFICACIÓN TÉCNICA: Trigger de Creación Automática de Propiedad
Rol Asignado: Database Administrator / Backend Developer
Contexto: Se ha confirmado que el flujo de registro actual deja a los usuarios sin propiedad inicial, causando errores 406 en el frontend y una mala experiencia de usuario. Aunque se ha planeado corregir el RPC (Prompt 10), la solución más robusta es garantizar la creación atómica de la propiedad *dentro* del trigger de bienvenida, eliminando la dependencia de llamadas posteriores desde el cliente o servidor.

🧠 Análisis de Contexto (Automático):
- **Trigger Actual:** `on_auth_user_created` llama a `handle_new_user`.
- **Función:** `handle_new_user` inserta en `public.usuario` y `public.puntuacion_usuario`.
- **Déficit:** No inserta en `public.propiedad`.
- **Restricción:** `crear_propiedad_inicial` usa `auth.uid()`, el cual podría no estar disponible en el contexto del trigger `SECURITY DEFINER`.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/20250529000000_auto_create_property_trigger.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - Refactorización de RPC]
Acción: Modificar `crear_propiedad_inicial` para soportar ejecución por sistema.
Detalle:
- Crear migración `20250529000000_auto_create_property_trigger.sql`.
- Actualizar firma de `crear_propiedad_inicial`:
  - Agregar `p_usuario_id uuid DEFAULT auth.uid()`.
  - Hacer opcionales `p_ciudad`, `p_barrio`, `p_edificio` (DEFAULT NULL).
- Lógica interna:
  - Usar `COALESCE(p_usuario_id, auth.uid())` para determinar el dueño.
  - Si las coordenadas son NULL, invocar `obtener_coordenada_libre()` (Prompt 06) o generar random allí mismo.
  - Generar nombre por defecto si es NULL (ej: 'Base ' || substring(uuid, 1, 8)).

[Fase 2: DB Layer - Actualización de Trigger]
Acción: Actualizar `handle_new_user`.
Detalle:
- En la misma migración, redefinir `handle_new_user`.
- Mantener inserciones existentes (`usuario`, `puntuacion`).
- Agregar llamada a `crear_propiedad_inicial`:
  ```sql
  PERFORM public.crear_propiedad_inicial(
      p_nombre := 'Imperio de ' || COALESCE(new.raw_user_meta_data->>'full_name', 'Jugador'),
      p_ciudad := NULL,
      p_barrio := NULL,
      p_edificio := NULL,
      p_usuario_id := new.id
  );
  ```
- Manejar excepciones: Si falla la creación de propiedad, el usuario *no* debe crearse (transacción atómica del trigger), o bien loguear el error y permitir continuar (dependiendo de la severidad deseada; sugerencia: permitir continuar pero loguear, para no bloquear signups si el mapa está lleno).

✅ CRITERIOS DE ACEPTACIÓN
- Todo nuevo usuario registrado en `auth.users` debe tener automáticamente una entrada correspondiente en `public.propiedad`.
- La propiedad debe tener coordenadas válidas y únicas.
- La propiedad debe tener las 7 habitaciones iniciales y recursos base.

🛡️ REGLAS DE ORO
Runtime: Bun.
Seguridad: La función `handle_new_user` es `SECURITY DEFINER`. Asegurar que tenga permisos para insertar en `propiedad` y `habitacion_usuario`.
Contexto: `auth.uid()` suele ser nulo en triggers de inserción de Auth; usar siempre `new.id`.
