import subprocess
import sys
import os

def run_script(script_name):
    """Ejecuta un script de Python y maneja la salida."""
    # Asegura que la ruta sea relativa a la ubicación de este script
    script_path = os.path.join(os.path.dirname(__file__), script_name)
    print(f"--- Ejecutando {script_name} ---")
    
    # sys.executable es la ruta al intérprete de Python actual
    # Esto asegura que se use el mismo entorno.
    try:
        process = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            check=True,  # Lanza una excepción si el script falla
            encoding='utf-8'
        )
        
        if process.stdout:
            print(process.stdout)
        if process.stderr:
            print(f"Salida de error estándar (warnings) de {script_name}:")
            print(process.stderr)
        
        print(f"--- {script_name} finalizó correctamente ---")
        return 0
    except FileNotFoundError:
        print(f"Error: No se encontró el script '{script_path}'.")
        return 1
    except subprocess.CalledProcessError as e:
        print(f"Error al ejecutar {script_name} (código de salida: {e.returncode}):")
        if e.stdout:
            print("Salida estándar:")
            print(e.stdout)
        if e.stderr:
            print("Salida de error:")
            print(e.stderr)
        print(f"--- {script_name} finalizó con errores ---")
        return e.returncode

def main():
    """Función principal para ejecutar los scripts en orden."""
    print("Iniciando la ejecución de scripts de generación de contexto...")
    
    scripts_a_ejecutar = [
        'convert_sql_to_json.py',
        'map_source_structure.py'
    ]
    
    for script in scripts_a_ejecutar:
        return_code = run_script(script)
        if return_code != 0:
            print(f"\nLa ejecución se detuvo debido a un error en {script}.")
            break
    
    print("\nProceso de ejecución de scripts completado.")

if __name__ == "__main__":
    main()
