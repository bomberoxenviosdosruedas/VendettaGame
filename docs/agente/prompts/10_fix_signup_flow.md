🏗️ ESPECIFICACIÓN TÉCNICA: Flujo de Registro Completo (Signup + Propiedad)
Rol Asignado: Full Stack Developer
Contexto: Actualmente, el registro en `/signup` solo crea el usuario en `auth.users` (y `public.usuario` vía trigger). El usuario nuevo queda en un estado "limbo" sin propiedad asignada, lo que rompe la experiencia o requiere pasos manuales extra. Se requiere ajustar el flujo para que, al registrarse, se cree automáticamente una propiedad inicial (con coordenadas aleatorias y nombre por defecto o derivado) y sus habitaciones, garantizando que el usuario aterrice en el dashboard listo para jugar.

🧠 Análisis de Contexto (Automático):
- **Componentes:** `src/components/auth/signup/signup-form.tsx`
- **Server Action:** `src/actions/auth.actions.ts` -> `registerAction`
- **RPC Existente:** `crear_propiedad_inicial` (Requiere ajustes para aceptar nulos/defaults).
- **Nueva RPC (Prompt 06):** `obtener_coordenada_libre` (Para lógica aleatoria).

📦 ARCHIVOS A INTERVENIR
1.  `supabase/migrations/20250528000000_update_create_property_logic.sql` (Modificar RPC)
2.  `src/actions/auth.actions.ts` (Integrar creación de propiedad)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Actualizar `crear_propiedad_inicial` para soportar auto-asignación.
Detalle:
- Crear migración `20250528000000_update_create_property_logic.sql`.
- Modificar `crear_propiedad_inicial` para que los parámetros `p_ciudad`, `p_barrio`, `p_edificio` sean opcionales (DEFAULT NULL).
- Dentro de la función:
  - Si los parámetros son NULL, llamar a `public.obtener_coordenada_libre()` (definida en Prompt 06) para obtener valores.
  - Si `p_nombre` es NULL o vacío, generar uno por defecto (ej: "Imperio de [NombreUsuario]").
- Mantener la lógica de creación de las 7 habitaciones (Prompt 07) y `ultima_recogida_recursos` (Prompt 09/Log).

[Fase 2: Service Layer - Server Action]
Acción: Actualizar `registerAction` en `src/actions/auth.actions.ts`.
Detalle:
1.  Mantener el registro (`signUp`).
2.  Si `signUp` es exitoso y retorna una sesión (o el usuario se loguea automáticamente):
    - Invocar `crear_propiedad_inicial` con coordenadas NULL (para que la DB las genere).
    - Usar el nombre de usuario o un string genérico para la propiedad.
3.  Si la creación de propiedad falla, manejar el error (aunque el usuario ya esté creado, quizás redirigir a una página de "Setup manual" como fallback).
4.  Asegurar que la redirección final sea a `/dashboard`.

*Nota:* Si Supabase requiere confirmación de email, la creación de propiedad fallará por falta de sesión activa inmediata.
*Estrategia Alternativa (Si Email Confirm es True):* Crear un trigger en `public.usuario` (AFTER INSERT) que llame a la lógica de propiedad. Sin embargo, para este prompt asumiremos que queremos control explícito en el Action o que el login es inmediato. Si no es posible en el Action por falta de sesión, el prompt debe instruir crear un paso de "Onboarding" (`/setup`) al que se redirige tras el primer login, que llame a esta RPC.

*Decisión para este Prompt:* Intentar en el Action (asumiendo flujo dev/sin confirmación) O preparar el Trigger de base de datos para máxima robustez.
*Preferencia del usuario:* "Ajustar funcionalidad en /signup".
*Instrucción:* Modificar el RPC para ser robusto y llamarlo desde el Action si hay sesión, o delegar a un Trigger `AFTER INSERT ON public.usuario` que ejecute con privilegios de sistema (`security definer`) para crear la propiedad automáticamente. **Mejor opción:** Trigger en DB para garantizar propiedad siempre.

*Refinamiento Fase 1:*
- Agregar Trigger: `trigger_crear_propiedad_automatica` en `public.usuario`.
- Este trigger llama a una función que ejecuta la lógica de `crear_propiedad_inicial` con valores random.
- De esta forma, `registerAction` no necesita cambios complejos, solo registrar y listo. La DB se encarga del resto.

✅ CRITERIOS DE ACEPTACIÓN
- Al registrar un usuario en `/signup`, debe aparecer inmediatamente en la tabla `propiedad` con coordenadas asignadas y 7 habitaciones creadas.
- No debe ser necesario un paso adicional de "Crear Propiedad" en el frontend.

🛡️ REGLAS DE ORO
Runtime: Bun.
Strategy: Automatización vía DB (Trigger) preferida sobre orquestación frágil en cliente/servidor stateless.
