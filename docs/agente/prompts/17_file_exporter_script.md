🏗️ ESPECIFICACIÓN TÉCNICA: Exportador de Código Fuente a JSON
Rol Asignado: Python Tooling Developer
Contexto: Se requiere una herramienta para extraer el contenido de múltiples archivos fuente del proyecto y consolidarlos en un único archivo JSON. Esto facilita el análisis masivo de código por parte de agentes de IA o herramientas de auditoría externa. La lista de archivos a procesar se definirá en un archivo de texto plano.

🧠 Análisis de Contexto (Automático):
- **Input:** `scripts/exportador/listado.txt` (Lista de rutas relativas, una por línea).
- **Output:** `scripts/exportador/codigo_fuente.json`.
- **Estructura JSON:** Objeto clave-valor donde:
  - Key: Ruta relativa del archivo.
  - Value: Contenido de texto del archivo.

📦 ARCHIVOS A INTERVENIR
scripts/exportador/exportar_archivos.py (Crear)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Configuración del Script]
Acción: Crear `scripts/exportador/exportar_archivos.py`.
Detalle:
- Importar `os`, `json`.
- Definir rutas base. Asumir que el script se ejecuta desde la raíz del proyecto o ajustar rutas relativas.

[Fase 2: Lectura de Lista]
Acción: Leer `listado.txt`.
Detalle:
- Abrir `scripts/exportador/listado.txt`.
- Leer líneas, eliminar espacios en blanco (trim) y líneas vacías.
- Almacenar en una lista `file_paths`.

[Fase 3: Extracción de Contenido]
Acción: Iterar y leer archivos.
Detalle:
- Crear diccionario `source_code = {}`.
- Para cada `path` en `file_paths`:
  - Verificar si `os.path.exists(path)`.
  - Si existe: Leer contenido (utf-8) y asignar `source_code[path] = content`.
  - Si no existe: Imprimir advertencia `print(f"Advertencia: Archivo no encontrado: {path}")` y continuar.

[Fase 4: Exportación]
Acción: Guardar JSON.
Detalle:
- Escribir `source_code` en `scripts/exportador/codigo_fuente.json`.
- Usar `indent=2` para legibilidad.
- Asegurar encoding `utf-8`.

✅ CRITERIOS DE ACEPTACIÓN
- El script debe generar un JSON válido.
- Debe manejar caracteres especiales (tildes, emojis) correctamente.
- No debe fallar si un archivo de la lista no existe (debe saltarlo).

🛡️ REGLAS DE ORO
Runtime: Python 3.
Paths: Manejar rutas relativas desde la raíz del repositorio.
