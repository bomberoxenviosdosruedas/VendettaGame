🏗️ ESPECIFICACIÓN TÉCNICA: Fix Dashboard Aggregation Logic
Rol Asignado: Senior Database Engineer
Contexto: La función RPC `get_dashboard_data` falla con el error `42803` ("column must appear in the GROUP BY clause or be used in an aggregate function") cuando se intenta ordenar los resultados de las colas de construcción, investigación y reclutamiento. Esto sucede porque `ORDER BY` se está usando fuera de la función de agregación `json_agg`, lo cual es inválido en este contexto en PostgreSQL cuando no hay un `GROUP BY` explícito que incluya la columna de ordenamiento. El objetivo es corregir la consulta moviendo el `ORDER BY` dentro de `json_agg`.

🧠 Análisis de Contexto (Automático):
- Tablas Impactadas: `cola_construccion`, `cola_investigacion`, `cola_reclutamiento`.
- Funciones Existentes: `get_dashboard_data` (en `supabase/migrations/20250524000000_dashboard_rpc.sql`).
- Archivos de Código: No aplica cambios en TS, solo en SQL.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/20250525000000_fix_dashboard_aggregation.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Crear nueva migración `supabase/migrations/20250525000000_fix_dashboard_aggregation.sql`.
Detalle:
1.  Definir `CREATE OR REPLACE FUNCTION public.get_dashboard_data(p_propiedad_id uuid)`.
2.  Copiar el cuerpo de la función original desde `scripts/contexto/20250524000000_dashboard_rpc.sql.json` (o el archivo original).
3.  Localizar las consultas que llenan `v_cola_construccion`, `v_cola_investigacion`, y `v_cola_reclutamiento`.
4.  Modificar la sintaxis de agregación y ordenamiento.
    *   **Antes:** `SELECT json_agg(...) INTO ... FROM ... ORDER BY fecha_fin;`
    *   **Después:** `SELECT json_agg(... ORDER BY fecha_fin) INTO ... FROM ...;`
5.  Asegurarse de mantener `SECURITY DEFINER` y `SET search_path = public`.

Ejemplo de corrección para `v_cola_construccion`:
```sql
    SELECT json_agg(json_build_object(
        'id', cc.id,
        'habitacion_id', cc.habitacion_id,
        'nivel_destino', cc.nivel_destino,
        'fecha_fin', cc.fecha_fin,
        'nombre', ch.nombre
    ) ORDER BY cc.fecha_fin) INTO v_cola_construccion
    FROM public.cola_construccion cc
    JOIN public.configuracion_habitacion ch ON cc.habitacion_id = ch.id
    WHERE cc.propiedad_id = p_propiedad_id;
```

Repetir el patrón para `v_cola_investigacion` (ordenar por `ci.fecha_fin`) y `v_cola_reclutamiento` (ordenar por `cr.fecha_fin`).

[Fase 2: Service Layer - Next.js]
Acción: Ninguna.
Detalle: La interfaz RPC se mantiene idéntica, por lo que no se requieren cambios en el código TypeScript.

[Fase 3: UI Layer - React]
Acción: Ninguna.

✅ CRITERIOS DE ACEPTACIÓN
- La llamada a `get_dashboard_data` no debe lanzar el error `42803`.
- Los datos de las colas deben devolverse ordenados por `fecha_fin` ascendente dentro del array JSON.
- La función debe compilar correctamente en PostgreSQL.

🛡️ REGLAS DE ORO
Runtime: Bun.
Framework: Next.js 15+ (Server Actions).
DB: Supabase (PostgreSQL).
Contexto: Consultar `scripts/contexto` antes de asumir nada.
