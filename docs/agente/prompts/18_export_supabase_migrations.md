🏗️ ESPECIFICACIÓN TÉCNICA: Exportador de Migraciones Supabase a JSON
Rol Asignado: Python Tooling Developer
Contexto: Se requiere una herramienta específica para consolidar el contenido de todas las migraciones de base de datos listadas en un archivo de texto (`supabase.txt`) en un único archivo JSON. Esto es crucial para análisis de auditoría, detección de duplicados y revisión histórica de cambios en la base de datos.

🧠 Análisis de Contexto (Automático):
- **Input:** `scripts/exportador/supabase.txt` (Lista de rutas de migraciones, una por línea).
- **Output:** `scripts/exportador/migraciones.json`.
- **Formato Output:** Objeto clave-valor:
  - Key: Ruta del archivo (ej: `supabase/migrations/2025...sql`).
  - Value: Contenido SQL del archivo.

📦 ARCHIVOS A INTERVENIR
scripts/exportador/exportar_migraciones.py (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Configuración del Script]
Acción: Crear `scripts/exportador/exportar_migraciones.py`.
Detalle:
- Importar `os`, `json`.
- Definir archivo de entrada: `scripts/exportador/supabase.txt`.
- Definir archivo de salida: `scripts/exportador/migraciones.json`.

[Fase 2: Lectura y Procesamiento]
Acción: Iterar lista de archivos.
Detalle:
- Leer `supabase.txt`.
- Limpiar líneas (strip).
- Para cada ruta:
  - Verificar existencia.
  - Leer contenido.
  - Almacenar en diccionario `migrations_data`.
  - Si no existe, imprimir "WARNING: Archivo no encontrado: [ruta]".

[Fase 3: Exportación]
Acción: Serializar a JSON.
Detalle:
- Guardar `migrations_data` en el archivo de salida.
- Usar `indent=2` y `ensure_ascii=False`.

✅ CRITERIOS DE ACEPTACIÓN
- El script debe procesar la lista provista en `supabase.txt`.
- El JSON resultante debe contener el código SQL de todas las migraciones encontradas.
- Debe ser robusto ante archivos faltantes (no detener la ejecución, solo avisar).

🛡️ REGLAS DE ORO
Runtime: Python 3.
Encoding: UTF-8 obligatorio.
