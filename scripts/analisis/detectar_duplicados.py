import os
import re
import json
import glob
from pathlib import Path

# Configuración
MIGRATIONS_DIR = 'supabase/migrations/'
OUTPUT_FILE = 'scripts/analisis/reporte_duplicados.json'

# Regex Patterns for identifying start of definitions
PATTERNS = {
    "tables": re.compile(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)', re.IGNORECASE),
    "functions": re.compile(r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?(\w+)', re.IGNORECASE),
    "types": re.compile(r'CREATE\s+TYPE\s+(?:public\.)?(\w+)', re.IGNORECASE),
    "policies": re.compile(r'CREATE\s+POLICY\s+"?([^"\s]+)"?\s+ON\s+(?:public\.)?(\w+)', re.IGNORECASE),
    "triggers": re.compile(r'CREATE\s+TRIGGER\s+"?([^"\s]+)"?\s+ON\s+(?:public\.)?(\w+)', re.IGNORECASE),
    "alter_tables": re.compile(r'ALTER\s+TABLE\s+(?:ONLY\s+)?(?:public\.)?(\w+)', re.IGNORECASE)
}

def analyze_migrations():
    # Estructura para almacenar hallazgos
    objects = {
        "tables": {},
        "functions": {},
        "types": {},
        "policies": {},
        "triggers": {},
        "alter_tables": {}
    }

    # Obtener archivos ordenados
    files = sorted(glob.glob(os.path.join(MIGRATIONS_DIR, '*.sql')))
    
    if not files:
        print(f"No se encontraron migraciones en {MIGRATIONS_DIR}")
        return

    print(f"Analizando {len(files)} archivos de migración...")

    for file_path in files:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"Error leyendo {filename}: {e}")
            continue

        process_file(filename, lines, objects)

    # Generar Reporte
    report = generate_report(objects)
    
    # Guardar JSON
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)
    
    print(f"Reporte generado en {OUTPUT_FILE}")

def process_file(filename, lines, objects):
    """
    Procesa un archivo SQL línea por línea extrayendo bloques completos.
    """
    current_block = []
    capture_mode = False
    in_dollar_quote = False
    dollar_quote_tag = ""
    
    start_line = 0
    current_match_type = None
    current_match_name = None
    current_match_category = None
    
    for i, line in enumerate(lines):
        line_num = i + 1
        
        # Detectar inicio de bloque si no estamos capturando
        if not capture_mode:
            match_found = False
            
            # Chequear cada tipo de objeto
            # Prioridad: Funciones y Triggers primero porque son más complejos? No, regex son específicos.
            
            # Tablas
            if match := PATTERNS["tables"].search(line):
                start_capture(objects, "tables", match.group(1), filename, line_num, "CREATE_TABLE")
                match_found = True
            
            elif match := PATTERNS["functions"].search(line):
                start_capture(objects, "functions", match.group(1), filename, line_num, "CREATE_FUNCTION")
                match_found = True
                
            elif match := PATTERNS["types"].search(line):
                start_capture(objects, "types", match.group(1), filename, line_num, "CREATE_TYPE")
                match_found = True

            elif match := PATTERNS["policies"].search(line):
                full_name = f"{match.group(2)}.{match.group(1)}" # Table.Policy
                start_capture(objects, "policies", full_name, filename, line_num, "CREATE_POLICY")
                match_found = True

            elif match := PATTERNS["triggers"].search(line):
                full_name = f"{match.group(2)}.{match.group(1)}" # Table.Trigger
                start_capture(objects, "triggers", full_name, filename, line_num, "CREATE_TRIGGER")
                match_found = True
                
            elif match := PATTERNS["alter_tables"].search(line):
                start_capture(objects, "alter_tables", match.group(1), filename, line_num, "ALTER_TABLE")
                match_found = True

            if match_found:
                # Inicializar captura
                capture_mode = True
                current_block = [line]
                current_match_category = last_captured_meta['category']
                current_match_name = last_captured_meta['name']
                start_line = line_num
                
                # Check if it ends on the same line (simple statements)
                # But we need to be careful about dollar quotes starting on the same line
                in_dollar_quote, dollar_quote_tag = check_dollar_quote(line, in_dollar_quote, dollar_quote_tag)
                if not in_dollar_quote and line.strip().rstrip().endswith(';'):
                    finish_capture(objects, current_match_category, current_match_name, current_block)
                    capture_mode = False
                continue
        
        # Si estamos en modo captura
        if capture_mode:
            # Añadir línea actual (si no es la misma que la start, ya añadida arriba)
            if i + 1 != start_line: # Fix: start_line is 1-based, i is 0-based
                current_block.append(line)
            
            # Check dollar quotes
            in_dollar_quote, dollar_quote_tag = check_dollar_quote(line, in_dollar_quote, dollar_quote_tag)
            
            # Check termination
            # A statement ends if we see a semicolon AND we are not inside a dollar quote block
            # Note: This is a heuristic. Semicolons inside strings '...' are not handled here for simplicity,
            # but usually migration definitions are well structured.
            
            if not in_dollar_quote:
                stripped = line.strip()
                # Ignore comments for termination check?
                # Simple check: ends with ;
                if stripped.rstrip().endswith(';'):
                    finish_capture(objects, current_match_category, current_match_name, current_block)
                    capture_mode = False
                    # Reset
                    current_block = []
                    in_dollar_quote = False
                    dollar_quote_tag = ""

# Helper global variable to pass metadata between loops (ugly but simple for this script structure)
last_captured_meta = {}

def start_capture(objects, category, name, filename, line, type_str):
    if name not in objects[category]:
        objects[category][name] = []
    
    # Pre-crear la entrada, pero sin el código todavía
    entry = {
        "file": filename,
        "line": line,
        "type": type_str,
        "code": "" # To be filled later
    }
    objects[category][name].append(entry)
    
    last_captured_meta['category'] = category
    last_captured_meta['name'] = name

def finish_capture(objects, category, name, block_lines):
    # Recuperar la última entrada añadida para este nombre y actualizar el código
    entries = objects[category][name]
    entries[-1]["code"] = "".join(block_lines)

def check_dollar_quote(line, in_quote, current_tag):
    """
    Updates the dollar quote state based on the line content.
    """
    # Find all $$ or $tag$ matches
    # Regex for dollar tags: \$([a-zA-Z0-9_]*)\$
    matches = list(re.finditer(r'\$([a-zA-Z0-9_]*)\$', line))
    
    for match in matches:
        tag = match.group(1)
        if not in_quote:
            # Start of a quote
            in_quote = True
            current_tag = tag
        else:
            # Potential end of quote
            if tag == current_tag:
                in_quote = False
                current_tag = ""
            # Else: nested dollar quote or different tag? 
            # PostgreSQL allows nested dollar quotes if tags are different.
            # But here we just assume standard usage: match the opening tag to close.
            
    return in_quote, current_tag

def generate_report(objects):
    resumen = {
        "total_tablas_detectadas": len(objects["tables"]),
        "total_funciones_detectadas": len(objects["functions"]),
        "total_policies_detectadas": len(objects["policies"]),
        "objetos_duplicados_o_modificados": 0
    }
    
    detalles = {}
    all_categories = ["tables", "functions", "types", "policies", "triggers"]
    
    for cat in all_categories:
        detalles[cat] = {}
        for name, occurrences in objects[cat].items():
            
            is_interesting = len(occurrences) > 1
            
            # Si es tabla, checar si hay alters
            alters = []
            if cat == "tables" and name in objects["alter_tables"]:
                alters = objects["alter_tables"][name]
                if len(alters) > 0:
                    is_interesting = True
            
            if is_interesting:
                # Ordenar cronológicamente
                history = sorted(occurrences + alters, key=lambda x: (x['file'], x['line']))
                detalles[cat][name] = history
                resumen["objetos_duplicados_o_modificados"] += 1

    return {
        "resumen": resumen,
        "detalles": detalles
    }

if __name__ == "__main__":
    analyze_migrations()
