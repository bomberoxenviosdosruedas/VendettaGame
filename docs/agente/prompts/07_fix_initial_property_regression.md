🏗️ ESPECIFICACIÓN TÉCNICA: Corrección de Regresión en Inicialización de Propiedad
Rol Asignado: Backend Developer / DBA
Contexto: El "Informe de Análisis de Duplicidad" ha detectado una **regresión crítica** en la función `public.crear_propiedad_inicial`. La migración `20250523000000_sync_logic_improvements.sql` sobrescribió accidentalmente la lógica introducida en Febrero (`20250212...`), revirtiendo la cantidad de edificios iniciales de 7 a 3. Es necesario restaurar la lógica correcta manteniendo las mejoras recientes (timestamp de recursos).

🧠 Análisis de Contexto (Automático):
- **Objeto Afectado:** `public.crear_propiedad_inicial` (RPC).
- **Problema:** Solo inserta 3 edificios (`oficina_del_jefe`, `armeria`, `cerveceria`).
- **Estado Deseado:** Debe insertar 7 edificios:
  1. `oficina_del_jefe`
  2. `escuela_especializacion`
  3. `armeria`
  4. `deposito_de_municion`
  5. `cerveceria`
  6. `taberna`
  7. `campo_de_entrenamiento`
- **Requisito Adicional:** Mantener la inicialización de `ultima_recogida_recursos = NOW()` introducida en la versión v4.

📦 ARCHIVOS A INTERVENIR
supabase/migrations/20250527000001_fix_initial_property_regression.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Crear migración `supabase/migrations/20250527000001_fix_initial_property_regression.sql`.
Detalle:
- Usar `CREATE OR REPLACE FUNCTION public.crear_propiedad_inicial`.
- Mantener la firma actual (parámetros: nombre, ciudad, barrio, edificio).
- Mantener la validación de unicidad y existencia de usuario.
- En el `INSERT INTO public.propiedad`, mantener el campo `ultima_recogida_recursos` con valor `NOW()`.
- En el `INSERT INTO public.habitacion_usuario`, expandir la lista de `VALUES` para incluir los 7 edificios requeridos con nivel 1.

Código Base Sugerido (Mezcla de v3 y v4):
```sql
INSERT INTO public.habitacion_usuario (propiedad_id, habitacion_id, nivel)
VALUES
    (v_propiedad_id, 'oficina_del_jefe', 1),
    (v_propiedad_id, 'escuela_especializacion', 1),
    (v_propiedad_id, 'armeria', 1),
    (v_propiedad_id, 'deposito_de_municion', 1),
    (v_propiedad_id, 'cerveceria', 1),
    (v_propiedad_id, 'taberna', 1),
    (v_propiedad_id, 'campo_de_entrenamiento', 1);
```

✅ CRITERIOS DE ACEPTACIÓN
- La función debe compilar correctamente.
- Al ejecutar la función para un nuevo usuario, se deben crear 7 registros en `habitacion_usuario` asociados a la nueva propiedad.
- El campo `ultima_recogida_recursos` de la propiedad debe ser no nulo.

🛡️ REGLAS DE ORO
Runtime: Bun.
DB: Supabase (PostgreSQL).
Seguridad: `SECURITY DEFINER` y `SET search_path = public` deben mantenerse.
