🏗️ ESPECIFICACIÓN TÉCNICA: Lógica de Asignación de Coordenadas
Rol Asignado: Backend Architect (PL/SQL Specialist)
Contexto: Actualmente, la creación de una propiedad requiere coordenadas manuales, lo que puede causar conflictos si el usuario elige una ocupada. Se requiere implementar una lógica de "búsqueda de slot libre" en el backend (PostgreSQL) para sugerir o asignar coordenadas aleatorias válidas. El algoritmo debe intentar encontrar una ubicación vacía en un rango definido (Ciudad 1-50, Barrio 1-50, Edificio 1-255) con un límite de reintentos para evitar bucles infinitos.

🧠 Análisis de Contexto (Automático):
- Tabla Impactada: `public.propiedad`
- Restricción: Unicidad en `(coordenada_ciudad, coordenada_barrio, coordenada_edificio)`.
- Función Existente: `crear_propiedad_inicial` (RPC).

📦 ARCHIVOS A INTERVENIR
supabase/migrations/20250527000000_random_coordinates_rpc.sql (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: DB Layer - SQL]
Acción: Crear función `public.obtener_coordenada_libre()`.
Detalle:
- Crear una nueva migración.
- Implementar la función RPC que no recibe parámetros y devuelve un JSON o un Record con `{ciudad, barrio, edificio}`.
- Lógica:
  1.  Bucle `FOR i IN 1..20 LOOP`.
  2.  Generar aleatorios:
      - Ciudad: 1 a 50.
      - Barrio: 1 a 50.
      - Edificio: 1 a 255.
  3.  Verificar existencia en tabla `propiedad`:
      `IF NOT EXISTS (SELECT 1 FROM public.propiedad WHERE ...)`
  4.  Si no existe, retornar valores y salir.
  5.  Si llega al final del loop sin éxito, retornar `NULL` o error (aunque estadísticamente improbable).

Ejemplo de implementación solicitada (adaptada):
```sql
CREATE OR REPLACE FUNCTION public.obtener_coordenada_libre()
RETURNS json AS $$
DECLARE
    v_ciudad int;
    v_barrio int;
    v_edificio int;
    i int;
BEGIN
    FOR i IN 1..20 LOOP
        v_ciudad := floor(random() * 50 + 1)::int;
        v_barrio := floor(random() * 50 + 1)::int;
        v_edificio := floor(random() * 255 + 1)::int;

        IF NOT EXISTS (
            SELECT 1 FROM public.propiedad
            WHERE coordenada_ciudad = v_ciudad
            AND coordenada_barrio = v_barrio
            AND coordenada_edificio = v_edificio
        ) THEN
            RETURN json_build_object(
                'ciudad', v_ciudad,
                'barrio', v_barrio,
                'edificio', v_edificio
            );
        END IF;
    END LOOP;
    RETURN json_build_object('error', 'No se encontró ubicación libre tras 20 intentos');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

[Fase 2: Service Layer - Integración (Opcional en esta tarea)]
Acción: Documentar su uso.
Detalle: Esta función será llamada por el frontend cuando el usuario seleccione "Ubicación Aleatoria" o automáticamente si no selecciona nada.

✅ CRITERIOS DE ACEPTACIÓN
- La función debe compilar correctamente.
- Debe devolver coordenadas válidas dentro de los rangos especificados.
- Debe ser `SECURITY DEFINER` para poder consultar la tabla `propiedad` sin restricciones de RLS (aunque lectura suele ser pública, es más seguro para la lógica del sistema).

🛡️ REGLAS DE ORO
Runtime: Bun.
DB: Supabase (PostgreSQL).
Seguridad: Usar `search_path = public` explícito.
