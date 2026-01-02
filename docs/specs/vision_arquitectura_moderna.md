# Visión de Arquitectura Moderna y Optimización (Vendetta)

## 1. Introducción y Análisis del Paradigma
Este apartado establece la transición de los juegos de navegador clásicos hacia Aplicaciones Web Progresivas (PWA) modernas. Se define el objetivo principal: modernizar la experiencia del clásico Vendetta utilizando Next.js 16 para una interfaz ágil y Supabase para una persistencia de datos robusta. El desafío central abordado es la gestión de un universo persistente en tiempo real sin utilizar servidores de juego tradicionales (stateful), optando por una arquitectura sin servidor (serverless) orientada a eventos.

## 2. Análisis del Dominio: Deconstrucción de la Mecánica de 'Vendetta'
Se detallan las reglas de negocio fundamentales que deben ser modeladas:
 * **Modelo Económico:** Se describe el ciclo de recursos donde las Armas permiten la construcción, la Munición sostiene el mantenimiento militar, y el Alcohol se convierte en Dólares (moneda premium) a través de tabernas y contrabando.
 * **Sistema de Habitaciones:** A diferencia de la construcción de edificios aislados, se explica la lógica de gestionar "habitaciones" (Armería, Cervecería, Seguridad) dentro de un complejo base, estableciendo un árbol de dependencias tecnológicas.
 * **Dinámicas Territoriales:** Se define la regla de la "línea amarilla" (restricciones de construcción adyacente) y el sistema de "Honor" para penalizar la expansión desmedida y equilibrar el juego entre usuarios veteranos y novatos.

## 3. Arquitectura Frontend: Next.js 16 y la Interfaz Reactiva
Se explica cómo lograr una experiencia de usuario fluida sin descargas:
 * **Enrutamiento y Layouts:** Uso del App Router para mantener elementos persistentes (chat, recursos) mientras el usuario navega entre vistas, minimizando la carga del servidor.
 * **Server Actions:** Sustitución de la API REST tradicional por funciones que se ejecutan directamente en el servidor para mutar datos (ej. "Mejorar Edificio"), simplificando la comunicación cliente-servidor.
 * **UI Optimista:** Implementación de retroalimentación visual instantánea. El saldo de recursos visual se descuenta inmediatamente al hacer clic, sin esperar la confirmación de la base de datos, mejorando la percepción de velocidad.

## 4. Arquitectura Backend: Supabase como Motor de Juego
Descripción del uso de PostgreSQL no solo como almacén, sino como ejecutor de lógica:
 * **Esquema Relacional:** Diseño de tablas normalizadas para Usuarios, Recursos, Edificios y Unidades, asegurando la integridad de los datos.
 * **Seguridad (RLS):** Configuración de Políticas de Seguridad a Nivel de Fila para garantizar que cada jugador solo pueda leer y modificar sus propios datos, previniendo accesos no autorizados.
 * **Transacciones Atómicas (RPCs):** Uso de procedimientos almacenados para encapsular acciones complejas (ej. verificar saldo y construir) en una sola operación indivisible, evitando errores de consistencia o trampas por duplicación de peticiones.

## 5. El Algoritmo de Generación de Recursos
Explicación de la estrategia para manejar la producción de recursos de miles de jugadores:
 * **Evaluación Perezosa (Lazy Evaluation):** En lugar de actualizar la base de datos cada segundo para cada jugador (lo cual colapsaría el sistema), se calcula la producción matemáticamente solo cuando el jugador realiza una acción o consulta su estado. Se basa en la diferencia de tiempo entre la última acción y el momento actual.
 * **Eventos Temporales:** Uso de cronogramas internos de la base de datos (pg_cron) para resolver eventos pasivos como la finalización de una construcción o la llegada de un ataque.

## 6. Sistemas de Tiempo Real y Comunicación
Detalle de la infraestructura para la interactividad:
 * **WebSockets:** Uso del motor Realtime de Supabase para canales de chat global y notificaciones privadas (ej. alerta de ataque entrante) sin necesidad de que el jugador recargue la página.

## 7. Motor de Combate y Dinámicas del Mapa
 * **Resolución de Batallas:** Descripción de la lógica determinista donde el resultado del combate se calcula comparando el poder ofensivo total contra las defensas y bonificaciones tecnológicas, sin intervención de habilidad motriz.
 * **Cartografía:** Modelo de coordenadas para el mapa y cálculo de distancias para determinar los tiempos de viaje de las flotas.

## 8. Seguridad y Prevención de Automatización
Estrategias para mitigar el uso de bots y trampas:
 * **Validación de Servidor:** Principio de "Zero Trust" donde el servidor recalcula siempre distancias y costos, ignorando los datos enviados por el cliente que podrían estar manipulados.
 * **Limitación de Tasa (Rate Limiting):** Monitoreo de patrones de tráfico para bloquear cuentas que realizan acciones a velocidades inhumanas.

## 9. Especificación Técnica Detallada (Módulos y Algoritmos)
Resumen de los componentes técnicos específicos descritos en la segunda parte del informe:
 * **Diseño del Modelo de Datos:** Estructura de tablas para perfiles mafiosos, inventarios y colas de construcción.
 * **Lógica de Costos:** Aplicación de crecimiento exponencial para encarecer progresivamente las mejoras de edificios.
 * **Interfaz de Tablero:** Estrategias para cargar datos en paralelo y renderizar el estado del imperio.
 * **Renderizado del Mapa:** Uso de Canvas HTML5 para dibujar eficientemente el mapa global con miles de bases.
 * **Despliegue (CI/CD):** Flujos de trabajo automatizados para probar la lógica de combate y desplegar actualizaciones sin interrumpir el servicio.
