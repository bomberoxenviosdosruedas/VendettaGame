🏗️ ESPECIFICACIÓN TÉCNICA: Mapeo Recursivo de Componentes y Dependencias
Rol Asignado: Python Tooling Developer
Contexto: El mapeo actual de `page.tsx` a componentes directos es insuficiente porque oculta la complejidad real. Los componentes importados por las páginas (ej: `buildings-content.tsx`) tienen sus propias dependencias críticas (Actions, Providers, Hooks) que deben ser visualizadas. Se requiere "profundizar un nivel más" o hacer un escaneo recursivo limitado para revelar estas interacciones, excluyendo componentes de UI genéricos (`components/ui`) para reducir ruido.

🧠 Análisis de Contexto (Automático):
- Origen: `src/app/**/*.tsx` (Page).
- Nivel 1: Componentes importados directamente por la Page.
- Nivel 2: Dependencias de esos componentes (Actions, Hooks, Providers, otros Components).
- Exclusión: `src/components/ui/*` (Button, Card, Input, etc.).

📦 ARCHIVOS A INTERVENIR
scripts/analisis/map_page_components.py (Crear/Modificar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Lógica de Parsing Recursivo]
Acción: Modificar la función de análisis.
Detalle:
1.  **Función `analyze_file(filepath)`**:
    - Recibe una ruta de archivo.
    - Devuelve una lista de imports detectados (rutas normalizadas).
2.  **Ciclo Principal**:
    - Buscar `src/app/**/page.tsx`.
    - Para cada Page:
        - Obtener imports directos (Nivel 1).
        - Para cada import de Nivel 1 que NO sea `components/ui`:
            - Abrir ese archivo.
            - Obtener sus imports (Nivel 2).
            - Filtrar también `components/ui` del Nivel 2.

[Fase 2: Filtros de Rutas]
Acción: Ajustar Regex y lógica de filtrado.
Detalle:
- **Incluir**:
  - `src/components/*` (menos `/ui/`)
  - `src/actions/*`
  - `src/hooks/*`
  - `src/providers/*`
  - `src/lib/*` (opcional, si parece relevante)
- **Excluir**:
  - `src/components/ui/*` (Ruido visual)
  - Librerías externas (react, next, etc.)

[Fase 3: Estructura JSON Enriquecida]
Acción: Generar salida jerárquica.
Detalle:
- Estructura sugerida:
```json
{
  "src/app/dashboard/buildings/page.tsx": {
    "route": "/dashboard/buildings",
    "imports": [
      {
        "path": "src/components/dashboard/buildings/buildings-content.tsx",
        "type": "component",
        "dependencies": [
          "src/actions/game.actions.ts",
          "src/components/providers/game-state-provider.tsx",
          "src/hooks/use-toast.ts"
        ]
      }
    ]
  }
}
```

✅ CRITERIOS DE ACEPTACIÓN
- El script debe resolver recursivamente al menos un nivel de profundidad para componentes que no son UI.
- Los componentes de `src/components/ui` deben ser ignorados en el listado de dependencias detalladas (o agrupados en un campo "ui_used" simple si se desea, pero el prompt pide no remarcar).
- Debe capturar `actions`, `hooks` y `providers` importados por los componentes intermedios.

🛡️ REGLAS DE ORO
Runtime: Python 3.
Recursividad: Controlada (evitar bucles infinitos si hay referencias circulares, usar un set de `visited` si se hiciera full recursive, aunque aquí solo se piden 2 niveles).
Path Resolution: Resolver alias `@/` correctamente a `src/`.
