🏗️ ESPECIFICACIÓN TÉCNICA: Análisis Forense de Proyecto Legado (Vendetta PHP)
Rol Asignado: Legacy Systems Archaeologist / Reverse Engineer
Contexto: Disponemos del código fuente completo y la estructura de base de datos de la versión anterior del juego "Vendetta" (desarrollado en PHP, Zend Framework y MySQL). Este código ha sido exportado a archivos JSON para su análisis. El objetivo es "extraer el alma" del juego antiguo: comprender exactamente cómo funcionaba cada mecánica, fórmula y flujo para asegurar que la nueva versión mantenga la esencia funcional, aunque la tecnología cambie radicalmente.

🧠 Análisis de Contexto (Automático):
- Input Code: `scripts/proyectoanterior/codigo_fuente.json` (Contiene controladores, modelos y vistas PHP).
- Input DB: `scripts/proyectoanterior/migraciones.json` (Contiene el esquema MySQL, tablas y triggers).
- Objetivo: Generar un "Manual de Funcionamiento Legado" que detalle la lógica de negocio exacta.

📦 ARCHIVOS A INTERVENIR
docs/reports/informe_funcional_proyecto_anterior.md (Generar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Reconstrucción Mental del Modelo]
Acción: Mapeo de Entidades y Flujos.
Detalle:
1.  **Analizar DB:** Revisar `migraciones.json` para entender las relaciones entre tablas (ej: `users`, `buildings`, `troops`).
2.  **Analizar Controllers:** Revisar `codigo_fuente.json` buscando controladores clave (ej: `BuildingController`, `MissionController`, `CombatController`).
3.  **Correlación:** Relacionar cada acción de usuario (endpoint) con las tablas que modifica.

[Fase 2: Documentación por Módulo]
Acción: Desglosar la lógica de negocio.
Detalle: Deberás extraer y explicar (con pseudocódigo si es necesario) la lógica para:
1.  **Registro y Onboarding:** ¿Qué recursos/edificios iniciales recibía el usuario?
2.  **Economía:** Fórmulas de producción de recursos. ¿Cómo afectaba la energía/población?
3.  **Construcción e Investigación:**
    - Fórmulas de Costo: (Base * Factor ^ Nivel).
    - Fórmulas de Tiempo.
    - Requisitos (Dependencies).
4.  **Militar:**
    - Estadísticas de Tropas (Ataque, Defensa, Velocidad, Carga).
    - Lógica de Reclutamiento.
5.  **Sistema de Misiones:**
    - Tipos de misiones (Atacar, Transportar, Espiar).
    - Cálculo de tiempos de viaje.
6.  **Motor de Combate:**
    - ¿Cómo se resolvía una batalla? (Rondas, pérdidas, robo de recursos).

[Fase 3: Generación del Informe]
Acción: Escribir `docs/reports/informe_funcional_proyecto_anterior.md`.
Estructura Obligatoria:
1.  **Introducción:** Resumen de la tecnología y arquitectura del legado.
2.  **Mapa del Sitio:** Listado de todas las páginas/vistas identificadas y su función.
3.  **Mecánicas Nucleares (Deep Dive):**
    - **Recursos:** Tipos y fórmulas.
    - **Edificios:** Lista completa, función y costos escalares.
    - **Investigaciones:** Árbol tecnológico y efectos.
    - **Tropas:** Tabla de unidades con stats base.
4.  **Lógicas Complejas:**
    - **Algoritmo de Batalla:** Explicación paso a paso de la resolución de combate.
    - **Sistema de Puntos:** ¿Cómo se calculaba el ranking?
5.  **Conclusiones para la Migración:** ¿Qué lógicas son críticas de preservar y cuáles eran "hacks" de la época?

✅ CRITERIOS DE ACEPTACIÓN
- No inventar: Si una fórmula no está clara en el código, indicarlo como "No determinado".
- Precisión: Las fórmulas matemáticas deben ser exactas (ej: `Costo = 500 * 1.5 ^ (Nivel - 1)`).
- Exhaustividad: Cubrir desde el Login hasta el Endgame.

🛡️ REGLAS DE ORO
- El código PHP es la fuente de la verdad lógica.
- La base de datos MySQL es la fuente de la verdad estructural.
- Ignora código de infraestructura (configuración de Zend, librerías de terceros), céntrate en la carpeta `application/` o equivalente donde resida la lógica de negocio.
