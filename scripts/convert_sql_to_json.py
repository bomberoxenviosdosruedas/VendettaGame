import os
import json
import re
from datetime import datetime

MIGRATIONS_DIR = 'supabase/migrations/'
OUTPUT_DIR = 'scripts/contexto/'

def parse_sql_file(filepath):
    """
    Parses a SQL file to extract basic information about created tables and functions.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex patterns (simple approximation)
    table_pattern = re.compile(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(public\.\w+|\w+)', re.IGNORECASE)
    function_pattern = re.compile(r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(public\.\w+|\w+)', re.IGNORECASE)

    tables = table_pattern.findall(content)
    functions = function_pattern.findall(content)

    # Clean up names (remove 'public.' prefix if present for consistency, though keeping it is also fine)
    tables = [t.split('.')[-1] if '.' in t else t for t in tables]
    functions = [f.split('.')[-1] if '.' in f else f for f in functions]

    # Extract timestamp from filename
    filename = os.path.basename(filepath)
    # Assuming filename starts with YYYYMMDD...
    timestamp_str = filename.split('_')[0]
    try:
        if len(timestamp_str) >= 14:
            timestamp = datetime.strptime(timestamp_str[:14], "%Y%m%d%H%M%S").isoformat()
        elif len(timestamp_str) == 8:
             timestamp = datetime.strptime(timestamp_str, "%Y%m%d").isoformat()
        else:
             # Fallback for irregular timestamps
             timestamp = datetime.now().isoformat()
    except ValueError:
        timestamp = datetime.now().isoformat()


    return {
        "filename": filename,
        "timestamp": timestamp,
        "content": content,
        "summary": {
            "tables_created": sorted(list(set(tables))),
            "functions_created": sorted(list(set(functions)))
        }
    }

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    files = [f for f in os.listdir(MIGRATIONS_DIR) if f.endswith('.sql')]
    
    print(f"Found {len(files)} migration files.")

    for filename in files:
        filepath = os.path.join(MIGRATIONS_DIR, filename)
        try:
            data = parse_sql_file(filepath)
            
            output_filename = f"{filename}.json"
            output_path = os.path.join(OUTPUT_DIR, output_filename)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            
            print(f"Processed: {filename} -> {output_filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    main()
