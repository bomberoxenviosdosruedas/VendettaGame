🏗️ ESPECIFICACIÓN TÉCNICA: Corrección de Agrupación SQL en Dashboard RPC
Rol Asignado: Database Architect
Contexto: Se ha detectado un error `42803` en la función `get_dashboard_data` al cargar el dashboard. El error indica que la columna `cc.fecha_fin` (y probablemente otras en consultas similares) debe aparecer en la cláusula `GROUP BY` o ser usada en una función de agregación. Esto ocurre porque se está utilizando `ORDER BY` fuera de la función `json_agg` sin un `GROUP BY` explícito en la consulta principal.

🧠 Análisis de Contexto (Automático):
- Error: `column "cc.fecha_fin" must appear in the GROUP BY clause or be used in an aggregate function`.
- Función Afectada: `get_dashboard_data` en `supabase/migrations/20250531000000_enrich_dashboard_rpc.sql`.
- Causa Raíz: Uso de `ORDER BY` a nivel de query principal cuando se usa `json_agg` sin agrupar. La solución correcta en PostgreSQL para ordenar un array JSON agregado es poner el `ORDER BY` *dentro* de la función de agregación.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/YYYYMMDDHHMMSS_fix_dashboard_aggregation.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Crear nueva migración de corrección.
Detalle:
1.  Utilizar `CREATE OR REPLACE FUNCTION public.get_dashboard_data(p_propiedad_id uuid)`.
2.  Mantener toda la lógica existente de cálculo de recursos y verificaciones.
3.  **Corregir Agregación de Colas (Punto 5 del RPC):**
    - Mover `ORDER BY cc.fecha_fin` dentro de `json_agg(...)`.
    - Ejemplo:
      ```sql
      SELECT json_agg(json_build_object(...) ORDER BY cc.fecha_fin ASC) INTO v_cola_construccion
      FROM public.cola_construccion cc ...
      ```
    - Aplicar lo mismo para `cola_investigacion` (`ORDER BY ci.fecha_fin`) y `cola_reclutamiento` (`ORDER BY cr.fecha_fin`).
4.  **Seguridad:**
    - Asegurar que la función mantenga `SECURITY DEFINER`.
    - Establecer `SET search_path = ''` (y cualificar todas las tablas con `public.`) como se estableció en el estándar de seguridad reciente (Prompt 20).

✅ CRITERIOS DE ACEPTACIÓN
- La función se compila sin errores.
- La llamada a `get_dashboard_data` ya no devuelve error 42803.
- Los arrays de colas (construcción, investigación, reclutamiento) vienen ordenados cronológicamente por fecha de finalización.

🛡️ REGLAS DE ORO
Runtime: SQL (PostgreSQL).
DB: Supabase.
Sintaxis: `json_agg(expression ORDER BY sort_expression)`.
