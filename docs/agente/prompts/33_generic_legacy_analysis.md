🏗️ ESPECIFICACIÓN TÉCNICA: Análisis Universal de Legado (Blind Repository)
Rol Asignado: Senior Software Archaeologist
Contexto: Necesitamos analizar un proyecto de software antiguo (Legacy) para extraer su lógica de negocio y replicarla en un sistema moderno. NO conocemos la estructura de directorios estándar ni la ubicación exacta de los archivos. Debes actuar como un analista forense que recibe un volcado de código desconocido.

🧠 Análisis de Contexto (Dinámico):
- Input: Se te proporcionará el código fuente y/o esquemas de base de datos en el contexto de la conversación (o mediante lectura de archivos si se indican rutas).
- Stack Objetivo: PHP, Zend Framework, MySQL (Detectar patrones asociados).
- Objetivo: Generar un "Informe Funcional Integral" que describa CÓMO funciona el juego, no solo CÓMO está programado.

📦 ARCHIVOS A INTERVENIR
docs/reports/informe_funcional_generico.md (Generar)

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Reconocimiento de Terreno]
Acción: Escanear estructura y tecnologías.
Detalle:
1.  Identificar la estructura de directorios (MVC, Spaghetti, etc.).
2.  Localizar el "Core" de la lógica (Controladores, Modelos, Clases de Servicio).
3.  Identificar archivos de configuración de Base de Datos para entender el esquema.

[Fase 2: Extracción de Lógica de Negocio (Reverse Engineering)]
Acción: Documentar algoritmos exactos.
Debes buscar y detallar la lógica para las siguientes áreas críticas:

A. **Estructura del Juego (Site Map):**
   - Listar todas las páginas accesibles por el usuario.
   - Describir el propósito de cada una.

B. **Economía y Recursos:**
   - ¿Qué recursos existen?
   - Fórmulas de producción (Input -> Output / Tiempo).
   - ¿Cómo afectan los niveles de edificios a la producción?

C. **Infraestructura (Habitaciones/Edificios):**
   - Listado completo de edificios.
   - **Fórmulas de Costo:** Exactas (ej: `Base * 1.5 ^ Nivel`).
   - **Fórmulas de Tiempo:** ¿Cómo escala el tiempo de construcción?
   - Requisitos previos (Árbol de dependencias).

D. **Militar (Entrenamiento y Tropas):**
   - Catálogo de unidades (Stats: Ataque, Defensa, Capacidad, Velocidad).
   - Lógica de la Cola de Reclutamiento.

E. **Misiones y Mapa:**
   - Tipos de misiones (Atacar, Transportar, Espiar, Colonizar).
   - **Cálculo de Tiempos de Viaje:** Fórmulas de distancia y velocidad.

F. **Motor de Combate (Batallas):**
   - ¿Cómo se calcula el ganador?
   - ¿Hay rondas? ¿Cómo se distribuye el daño?
   - Cálculo de pérdidas y robo de recursos.

G. **Gestión de Usuarios:**
   - Proceso de Registro (Recursos/Edificios iniciales).
   - Sistema de Puntos/Ranking.

[Fase 3: Generación del Informe]
Acción: Escribir `docs/reports/informe_funcional_generico.md`.
Estructura:
1.  **Resumen Arquitectónico:** Breve descripción técnica detectada.
2.  **Diccionario de Datos:** Tablas y Entidades clave identificadas.
3.  **Manual de Mecánicas:** El detalle profundo de los puntos A-G de la Fase 2.
    - *Nota:* Usa pseudocódigo o fórmulas matemáticas explícitas para describir las reglas. No copies código PHP, traduce la lógica.

✅ CRITERIOS DE ACEPTACIÓN
- **Independencia de Rutas:** El análisis no debe fallar si las rutas cambian. Busca por contenido (ej: "busca archivos que contengan `class Building`").
- **Profundidad Matemática:** "Sube de nivel y cuesta más" NO es aceptable. "Cuesta `100 * 2^N`" ES aceptable.
- **Integridad:** Si falta información (ej: no encuentras la fórmula de combate), indícalo explícitamente como "LÓGICA NO ENCONTRADA".

🛡️ REGLAS DE ORO
- Tu objetivo es la VERDAD FUNCIONAL.
- Ignora el código "boilerplate" del framework, céntrate en la lógica de negocio (`Business Logic`).
- Si encuentras "Magic Numbers" (números sueltos en el código), documéntalos y trata de inferir su significado.
