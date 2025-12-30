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
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
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
        
        # Level 1: Get all direct imports of components/actions/hooks for the page
        # Original requirement was "componentes de UI (src/components/**)", but user 
        # expanded this implicitly by asking for "important components".
        # We will keep Level 1 broad but maybe filter for 'src/components' primarily
        # to stay close to original intent, or just grab everything.
        # Given the prompt, let's grab everything in src/ but highlight components.
        # But `map_page_components` implies components.
        # Let's filter Level 1 to `src/components` to respect original mandate, 
        # but allow actions/hooks in Level 2 as requested.
        
        raw_imports = analyze_file(page, filter_ui=False)
        level1_components = []
        
        for imp in raw_imports:
            # Level 1 Filter: We mainly care about components here as per original spec
            if 'src/components' in imp:
                level1_components.append(imp)
            # Note: We could include actions/hooks here too if desired, but sticking to 
            # "components map" for top level seems safer unless requested otherwise.
        
        detailed_components = []
        
        for comp_path in level1_components:
            comp_entry = {
                "path": comp_path,
                "dependencies": []
            }
            
            # Level 2 Analysis
            # "no es necesario remarcar en este nivel '@/components/ui/" -> Skip UI components analysis
            # Also, only analyze if it's a project file we can read
            if 'src/components/ui' not in comp_path:
                abs_path = os.path.join(ROOT_DIR, comp_path)
                if os.path.exists(abs_path):
                    # Get sub-dependencies, excluding UI components
                    sub_deps = analyze_file(abs_path, filter_ui=True)
                    comp_entry["dependencies"] = sub_deps
            
            detailed_components.append(comp_entry)
        
        result[rel_path] = {
            "route": route,
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
