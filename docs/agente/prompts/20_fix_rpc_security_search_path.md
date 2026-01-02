🏗️ ESPECIFICACIÓN TÉCNICA: Ajuste de Seguridad RPC (Search Path)
Rol Asignado: Database Security Specialist
Contexto: Un análisis de duplicidad y auditoría de seguridad ha detectado una regresión en la configuración de `search_path` de tres funciones críticas RPC (`iniciar_construccion_habitacion`, `iniciar_entrenamiento`, `iniciar_reclutamiento`). En la última migración, se configuraron con `SET search_path = public`, lo cual relaja la seguridad en funciones `SECURITY DEFINER` (riesgo de intercepción de objetos). Se requiere revertir estrictamente a `SET search_path = ''` y cualificar explícitamente todas las referencias a tablas con `public.`.

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `propiedad`, `habitacion_usuario`, `cola_construccion`, `configuracion_habitacion`, `configuracion_entrenamiento`, `entrenamiento_usuario`, `cola_investigacion`, `configuracion_tropa`, `cola_reclutamiento`, `requisito_habitacion`, `requisito_entrenamiento`.
- Funciones Existentes: 
    - `iniciar_construccion_habitacion`
    - `iniciar_entrenamiento`
    - `iniciar_reclutamiento`
    - `materializar_recursos` (ya cualificada correctamente, se invoca dentro).
- Referencia Legada: `supabase/migrations/20250524000001_fix_construction_rpc_security.sql` (fuente del cambio a `public`).

📦 ARCHIVOS A INTERVENIR
supabase/migrations/YYYYMMDDHHMMSS_secure_rpc_search_path.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Crear nueva migración de seguridad.
Detalle:
1.  Utilizar `CREATE OR REPLACE FUNCTION` para redefinir las siguientes funciones:
    - `iniciar_construccion_habitacion(p_propiedad_id uuid, p_habitacion_id text)`
    - `iniciar_entrenamiento(p_propiedad_id uuid, p_entrenamiento_id text)`
    - `iniciar_reclutamiento(p_propiedad_id uuid, p_tropa_id text, p_cantidad integer)`
2.  **Configuración de Seguridad:**
    - Mantener `SECURITY DEFINER`.
    - Cambiar `SET search_path = public` a **`SET search_path = ''`**.
3.  **Cualificación de Objetos:**
    - Revisar el cuerpo de cada función y asegurar que **CADA** referencia a tabla o función tenga el prefijo `public.`.
    - Ejemplos a corregir (si faltan):
        - `FROM requisito_habitacion` -> `FROM public.requisito_habitacion`
        - `FROM cola_construccion` -> `FROM public.cola_construccion`
        - `PERFORM materializar_recursos(...)` -> `PERFORM public.materializar_recursos(...)`
        - `make_interval(...)` -> `make_interval(...)` (funciones de sistema pg_catalog no necesitan prefijo si están en pg_catalog, pero funciones propias sí).
        - `NOW()` -> `NOW()` (pg_catalog).
4.  **Lógica de Negocio:**
    - Copiar exactamente la lógica de la migración `20250524000001_fix_construction_rpc_security.sql`.
    - No alterar cálculos ni flujos, solo la resolución de nombres.

✅ CRITERIOS DE ACEPTACIÓN
- Las 3 funciones deben tener `SET search_path = ''`.
- No deben existir errores de compilación SQL por tablas no encontradas (todo debe ser `public.tabla`).
- La funcionalidad de juego (construir, entrenar, reclutar) debe persistir sin cambios lógicos.

🛡️ REGLAS DE ORO
Runtime: SQL (PostgreSQL).
DB: Supabase.
Seguridad: Principio de mínimo privilegio en resolución de nombres.
Contexto: La función `public.materializar_recursos` también debe ser llamada como `public.materializar_recursos`.
