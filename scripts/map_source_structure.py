import os
import json
from pathlib import Path

BASE_DIR = 'src'
OUTPUT_DIR = 'scripts/contextocodigo'
TOP_LEVEL_DIRS = ['actions', 'ai', 'app', 'components', 'hooks', 'lib', 'types']

def get_full_structure(path):
    """
    Recursively builds a nested dictionary representing the file structure.
    """
    p = Path(path)
    name = p.name
    
    if p.is_file():
        content = ""
        try:
            content = p.read_text(encoding='utf-8')
        except Exception:
            content = "<binary or unreadable content>"
        return {"name": name, "type": "file", "content": content}
    
    children = []
    try:
        # Sort for consistent output
        for item in sorted(p.iterdir()):
            if item.name.startswith('.') or item.name == '__pycache__':
                continue
            children.append(get_full_structure(item))
    except PermissionError:
        pass # Skip directories we can't access

    return {
        "name": name,
        "type": "directory",
        "children": children
    }

def get_structure_paths(base_path, top_level_dirs):
    """
    Generates a flat list of relative directory paths grouped by top-level subdirectories.
    """
    structure_paths = {d: [] for d in top_level_dirs}
    # Add 'other' for files/dirs in src root that don't match or other directories not listed
    structure_paths['other'] = [] 

    base = Path(base_path)
    
    if not base.exists():
        return structure_paths

    for root, dirs, files in os.walk(base_path):
        # Filter hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        rel_path = os.path.relpath(root, start=os.path.dirname(base_path)) # relative to project root (parent of src)
        
        # Determine the key
        path_parts = Path(rel_path).parts
        
        # path_parts[0] should be 'src'
        if len(path_parts) > 1:
            top_dir = path_parts[1]
            if top_dir in top_level_dirs:
                structure_paths[top_dir].append(rel_path)
            else:
                # Subdirectories under src that are not in the list
                structure_paths['other'].append(rel_path)
        elif len(path_parts) == 1 and path_parts[0] == 'src':
             # The root 'src' directory itself could be added to 'other' or skipped. 
             # The request says "grouped by the main subdirectories of src". 
             # Let's add src itself to 'other' or a 'root' key? 
             # The example shows "actions": ["src/actions", ...].
             # So we should probably check if root matches "src/actions".
             pass

    # The os.walk approach above is slightly tricky for the top level folders themselves.
    # Let's iterate explicitly to match the "src/subdir" format.
    
    # Reset structure paths to ensure clean state
    structure_paths = {d: [] for d in top_level_dirs}
    
    for root, dirs, files in os.walk(base_path):
         dirs[:] = [d for d in dirs if not d.startswith('.')]
         rel_path = os.path.relpath(root, start='.') # Relative to project root
         
         parts = Path(rel_path).parts
         if len(parts) > 1 and parts[0] == 'src':
             top_dir = parts[1]
             if top_dir in top_level_dirs:
                 structure_paths[top_dir].append(rel_path)
    
    # Sort the lists
    for key in structure_paths:
        structure_paths[key].sort()
        
    # Remove empty keys if desired, but specification implies specific keys.
    # We will keep them even if empty to show structure exists or not.
    
    return structure_paths

def main():
    if not os.path.exists(BASE_DIR):
        print(f"Error: Directory '{BASE_DIR}' does not exist.")
        return

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 1. Full Structure
    full_structure = get_full_structure(BASE_DIR)
    
    full_structure_path = os.path.join(OUTPUT_DIR, 'structure_full.json')
    with open(full_structure_path, 'w', encoding='utf-8') as f:
        json.dump(full_structure, f, indent=2, ensure_ascii=False)
    print(f"Generated: {full_structure_path}")

    # 2. Paths Structure
    paths_structure = get_structure_paths(BASE_DIR, TOP_LEVEL_DIRS)
    
    paths_structure_path = os.path.join(OUTPUT_DIR, 'structure_paths.json')
    with open(paths_structure_path, 'w', encoding='utf-8') as f:
        json.dump(paths_structure, f, indent=2, ensure_ascii=False)
    print(f"Generated: {paths_structure_path}")

if __name__ == "__main__":
    main()
