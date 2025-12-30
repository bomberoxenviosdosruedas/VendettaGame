import os
import re
import json
import glob
from pathlib import Path

# Configuration
ROOT_DIR = os.getcwd()
SRC_DIR = os.path.join(ROOT_DIR, 'src')
OUTPUT_FILE = os.path.join(ROOT_DIR, 'scripts', 'analisis', 'page_component_map.json')

# Extensions to check for component files
EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js']

def get_page_files():
    """Find all page.tsx files in src/app."""
    pattern = os.path.join(SRC_DIR, 'app', '**', 'page.tsx')
    return glob.glob(pattern, recursive=True)

def get_file_content(file_path):
    """Read and return the content of a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return ""

def resolve_import_path(import_path, current_file_path):
    """
    Resolve an import path to a physical file path.
    Handles @/ alias and relative paths.
    Returns the relative path from project root if found, else None.
    """
    
    # Handle @/ alias
    if import_path.startswith('@/'):
        # Replace @/ with src/
        potential_path = os.path.join(ROOT_DIR, 'src', import_path[2:])
    elif import_path.startswith('.'):
        # Resolve relative path
        current_dir = os.path.dirname(current_file_path)
        potential_path = os.path.normpath(os.path.join(current_dir, import_path))
    else:
        # Not a project component (e.g. library import), or not following convention
        return None

    # Check if it points to a file directly or with extension
    candidates = []
    
    # 1. Exact match (unlikely for imports but possible)
    candidates.append(potential_path)
    
    # 2. Add extensions
    for ext in EXTENSIONS:
        candidates.append(potential_path + ext)
    
    # 3. Check for index files
    for ext in EXTENSIONS:
        candidates.append(os.path.join(potential_path, 'index' + ext))
        
    for candidate in candidates:
        if os.path.isfile(candidate):
            # Return path relative to root
            return os.path.relpath(candidate, ROOT_DIR)
            
    return None

def infer_route(file_path):
    """Infer the route URL from the file path."""
    rel_path = os.path.relpath(file_path, os.path.join(SRC_DIR, 'app'))
    # Remove /page.tsx
    route = os.path.dirname(rel_path)
    
    # Handle root page
    if route == '':
        return '/'
    
    # Handle dynamic routes logic if needed, but basic path is fine
    # Handle group routes (folders in parens like (auth))
    # We strip them for the route URL usually
    parts = route.split(os.sep)
    cleaned_parts = [p for p in parts if not (p.startswith('(') and p.endswith(')'))]
    
    return '/' + '/'.join(cleaned_parts)

def analyze_file(file_path, filter_ui=False):
    """
    Analyze a file for project imports.
    Returns a list of resolved file paths relative to ROOT_DIR.
    If filter_ui is True, excludes imports from src/components/ui.
    """
    content = get_file_content(file_path)
    if not content:
        return []

    # Regex to capture import paths
    import_pattern = re.compile(r'import\s+(?:[\w\s{},*]+)\s+from\s+[\'"]([^\'"]+)[\'"]')
    
    imports = []
    
    for match in import_pattern.finditer(content):
        import_path = match.group(1)
        
        # We want to capture any project import (@/... or relative)
        if import_path.startswith('@/') or import_path.startswith('.'):
            # Optimization: If filtering UI, skip resolving if we can tell from the import string
            if filter_ui and import_path.startswith('@/components/ui'):
                continue
                
            resolved = resolve_import_path(import_path, file_path)
            
            if resolved:
                # Security/Sanity check: Must be in src/
                if not resolved.startswith('src/'):
                    continue
                    
                # Apply filter_ui to resolved path as well (handles relative imports to UI)
                if filter_ui and 'src/components/ui' in resolved:
                    continue
                    
                imports.append(resolved)
                
    return sorted(list(set(imports))) # Deduplicate

def main():
    print("Starting component mapping...")
    pages = get_page_files()
    result = {}
    
    for page in pages:
        rel_path = os.path.relpath(page, ROOT_DIR)
        print(f"Analyzing {rel_path}...")
        
        route = infer_route(page)
        
        # Read Page Code
        page_code = get_file_content(page)
        
        # Level 1 Analysis
        raw_imports = analyze_file(page, filter_ui=False)
        level1_components = []
        
        for imp in raw_imports:
            # Filter: primarily interested in src/components for Level 1
            if 'src/components' in imp:
                level1_components.append(imp)
        
        detailed_components = []
        
        for comp_path in level1_components:
            abs_path = os.path.join(ROOT_DIR, comp_path)
            comp_code = get_file_content(abs_path)
            
            comp_entry = {
                "path": comp_path,
                "code": comp_code,
                "dependencies": []
            }
            
            # Level 2 Analysis
            if 'src/components/ui' not in comp_path and os.path.exists(abs_path):
                # Get sub-dependencies paths, excluding UI components
                sub_deps_paths = analyze_file(abs_path, filter_ui=True)
                
                # Convert paths to objects with code
                sub_deps_objects = []
                for dep_path in sub_deps_paths:
                    dep_abs_path = os.path.join(ROOT_DIR, dep_path)
                    dep_code = get_file_content(dep_abs_path)
                    sub_deps_objects.append({
                        "path": dep_path,
                        "code": dep_code
                    })
                
                comp_entry["dependencies"] = sub_deps_objects
            
            detailed_components.append(comp_entry)
        
        result[rel_path] = {
            "route": route,
            "code": page_code,
            "components": detailed_components
        }
        
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
        
    print(f"Mapping complete. Found {len(pages)} pages.")
    print(f"Output saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
