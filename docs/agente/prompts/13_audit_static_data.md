🏗️ ESPECIFICACIÓN TÉCNICA: Auditoría de Datos Estáticos
Rol Asignado: Code Quality Auditor
Contexto: El proyecto está en fase de transición de prototipo (mocks) a producción (Supabase). Se requiere una revisión exhaustiva para detectar cualquier remanente de datos estáticos ("hardcoded") que se esté mostrando al usuario en lugar de datos reales de la base de datos. Esto es crítico para asegurar que el jugador vea SU estado real.

🧠 Análisis de Contexto (Automático):
- **Objetivo:** Identificar `const MOCK_DATA`, arrays estáticos, valores fijos (ej: `nivel = 5`) en componentes de UI.
- **Alcance:** `src/app/**` y `src/components/dashboard/**`.
- **Exclusiones:** Archivos de configuración (`src/lib/constants.ts` es válido), componentes de UI puros (`src/components/ui/**`), textos de etiquetas/títulos.

📦 ARCHIVOS A INTERVENIR
docs/reports/auditoria_datos_estaticos_YYYYMMDD.md (Generar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Escaneo de Código]
Acción: Analizar archivos `.tsx` y `.ts` buscando patrones sospechosos.
Detalle:
- Buscar variables con nombres como `mock`, `dummy`, `static`, `testData`.
- Buscar arrays definidos localmente dentro de componentes que renderizan listas (ej: `const buildings = [{ id: 1, name: ... }]`).
- Buscar valores numéricos "mágicos" en JSX que deberían ser dinámicos (ej: `<span>500</span>` en lugar de `<span>{recursos.armas}</span>`).
- Verificar si los componentes de `dashboard` importan `useGameState` o reciben props de datos. Si no lo hacen y muestran info de juego, es sospechoso.

[Fase 2: Generación de Reporte]
Acción: Crear un informe en Markdown.
Detalle:
- Estructura del Informe:
  1.  **Resumen:** Total de archivos sospechosos.
  2.  **Hallazgos Prioritarios (High Severity):**
      - Datos que simulan estado del juego (recursos, edificios, tropas).
      - Mocks explícitos (`MOCK_DATA`).
  3.  **Hallazgos Menores (Low Severity):**
      - Valores por defecto en `useState` que podrían no estar hidratándose.
  4.  **Falsos Positivos:** (Opcional) Listar cosas que parecen datos pero son configuración.

Ejemplo de Entrada en Reporte:
```markdown
### src/components/dashboard/overview/overview-content.tsx
- **Línea 15:** `const resourceList = [...]` define una lista local para renderizar, pero extrae valores de `gameState`. -> **Seguro** (Es un mapper de UI).
### src/components/dashboard/new-feature/page.tsx
- **Línea 10:** `const troops = [{ name: 'Soldado', count: 100 }]`. -> **ALERTA**: Datos hardcodeados.
```

✅ CRITERIOS DE ACEPTACIÓN
- El reporte debe cubrir todos los archivos bajo `src/app/dashboard` y `src/components/dashboard`.
- Debe distinguir claramente entre "Configuración de UI" (permitido) y "Estado Falso" (prohibido).

🛡️ REGLAS DE ORO
Objetividad: Si hay duda, repórtalo como "A verificar".
Scope: No auditar `node_modules` ni `.next`.
