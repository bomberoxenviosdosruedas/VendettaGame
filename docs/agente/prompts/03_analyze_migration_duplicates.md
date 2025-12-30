🏗️ ESPECIFICACIÓN TÉCNICA: Script de Análisis de Duplicidad en Migraciones
Rol Asignado: DevOps Engineer / Python Specialist
Contexto: Necesitamos una herramienta de auditoría automatizada que escanee el historial de migraciones de Supabase (`supabase/migrations/*.sql`) para detectar objetos de base de datos (Tablas, Funciones, Políticas, Enums, Triggers) que han sido definidos, redefinidos o modificados múltiples veces. Esto ayudará a mantener la higiene del código, detectar lógica sobrescrita accidentalmente y entender la evolución del esquema.

🧠 Análisis de Contexto (Automático):
- Directorio de Migraciones: `supabase/migrations/`
- Output Esperado: `scripts/analisis/reporte_duplicados.json`
- Lenguaje: Python 3
- Dependencias: Librerías estándar (`os`, `re`, `json`, `glob`).

📦 ARCHIVOS A INTERVENIR
scripts/analisis/detectar_duplicados.py (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Configuración del Script]
Acción: Crear el archivo `scripts/analisis/detectar_duplicados.py`.
Detalle:
1.  Importar librerías necesarias.
2.  Definir rutas constantes: `MIGRATIONS_DIR = 'supabase/migrations/'`, `OUTPUT_FILE = 'scripts/analisis/reporte_duplicados.json'`.
3.  Asegurar que el directorio `scripts/analisis/` exista.

[Fase 2: Lógica de Parsing (Regex y Extracción de Bloques)]
Acción: Implementar función de análisis de SQL que capture tanto el nombre como el código completo.
Detalle:
- Iterar sobre archivos `.sql` ordenados alfabéticamente (cronológicamente).
- Usar Expresiones Regulares (Regex) para identificar el inicio de una definición y lógica para extraer el bloque completo (hasta el punto y coma final, manejando delimitadores como `$$` o paréntesis anidados).
  - **Tablas:** Detectar `CREATE TABLE ...` y extraer hasta el `;`.
  - **Funciones:** Detectar `CREATE (OR REPLACE)? FUNCTION ...` y extraer el cuerpo completo (típicamente hasta `LANGUAGE ...;` o el final del bloque `$$`).
  - **Políticas:** Detectar `CREATE POLICY ...` y extraer hasta el `;`.
  - **Triggers:** Detectar `CREATE TRIGGER ...` y extraer hasta el `;`.
  - **Alteraciones:** Detectar `ALTER TABLE ...` y extraer hasta el `;`.

[Fase 3: Estructura de Datos y Agregación]
Acción: Construir el diccionario de objetos incluyendo el código.
Detalle:
- Estructura del objeto de almacenamiento:
```python
objects = {
    "tables": { "nombre_tabla": [ { "file": "...", "line": 10, "type": "CREATE", "code": "CREATE TABLE..." } ] },
    "functions": { "nombre_funcion": [ { "file": "...", "line": 50, "type": "CREATE_FUNCTION", "code": "CREATE FUNCTION..." } ] },
    ...
}
```

[Fase 4: Generación de Reporte]
Acción: Filtrar y exportar JSON detallado.
Detalle:
- Identificar "Duplicados/Redefiniciones": Objetos que aparecen en > 1 archivo.
- Generar un JSON con la estructura solicitada:
  1.  `resumen`: Conteos totales.
  2.  `detalles`: Solo objetos con > 1 aparición. Cada entrada en la lista de apariciones DEBE incluir el campo `code` con el snippet SQL extraído.

Ejemplo de salida en `detalles`:
```json
"functions": {
  "handle_new_user": [
    {
      "file": "20240726120000_initial_schema.sql",
      "line": 30,
      "type": "CREATE_FUNCTION",
      "code": "CREATE FUNCTION public.handle_new_user()... END; $$ LANGUAGE plpgsql SECURITY DEFINER;"
    },
    {
      "file": "20250215_000000_fix.sql",
      "line": 1,
      "type": "CREATE_FUNCTION",
      "code": "CREATE OR REPLACE FUNCTION public.handle_new_user()... (versión modificada) ... END; $$ LANGUAGE plpgsql;"
    }
  ]
}
```

✅ CRITERIOS DE ACEPTACIÓN
- El script debe ejecutarse sin errores con `python3 scripts/analisis/detectar_duplicados.py`.
- El JSON resultante debe incluir el campo `code` con el texto completo de la definición SQL para cada ocurrencia listada en `detalles`.
- La lógica de extracción debe ser lo suficientemente robusta para capturar funciones de varias líneas.

🛡️ REGLAS DE ORO
Runtime: Bun (para el proyecto), Python 3 (para este script).
Contexto: No modificar las migraciones, solo leerlas.
Output: JSON formateado (indent=2) para fácil lectura humana.
