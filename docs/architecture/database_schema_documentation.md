# Documentación Técnica del Esquema de Base de Datos

## 1. Resumen Arquitectónico

El proyecto sigue una arquitectura **"Database-First"** (Base de Datos Primero) utilizando Supabase (PostgreSQL). Esto significa que la "Fuente de la Verdad" reside en la base de datos, y la lógica de negocio crítica se implementa mediante Procedimientos Almacenados (RPCs) y Triggers.

### Principios Clave:
- **Verdad en la DB:** El estado del juego (recursos, tropas, construcciones) se gestiona y valida en PostgreSQL.
- **Seguridad Robusta:** Se utiliza Row Level Security (RLS) para asegurar que los usuarios solo accedan a sus propios datos.
- **Lógica en el Servidor:** Operaciones críticas como recolección de recursos, construcción y combate se ejecutan vía RPCs para garantizar atomicidad y evitar trampas.
- **Lazy Updates:** La actualización de recursos no se realiza mediante cron jobs globales, sino que se calcula bajo demanda ("Lazy Calculation") cuando el usuario interactúa con el sistema, basándose en la diferencia de tiempo.

## 2. Módulos del Esquema

### 2.1 Core & Auth (Núcleo y Autenticación)
Tablas relacionadas con la gestión de usuarios y seguridad.

- **`usuario`**: Extiende la tabla `auth.users` de Supabase. Almacena perfil público (nombre, avatar, título).
- **`historial_acceso`**: Registro de logins e IPs para seguridad y auditoría.
- **`puntuacion_usuario`**: Métricas de rendimiento del jugador (puntos totales, honor, ranking).
- **`errores_configuracion`**: Log de errores de configuración para depuración.

### 2.2 Game Logic (Lógica del Juego)
Tablas que definen las reglas y el estado de las entidades del juego.

- **Configuración (Meta-Data):**
    - `configuracion_habitacion`: Definición de edificios (costos, producción).
    - `configuracion_entrenamiento`: Definición de investigaciones.
    - `configuracion_tropa`: Estadísticas de unidades militares.
    - `requisito_habitacion` / `requisito_entrenamiento`: Árbol tecnológico y dependencias.
    - `tropa_bonus_contrincante`: Tabla de ventajas/desventajas entre tipos de tropas.

- **Estado del Jugador:**
    - `propiedad`: La base/ciudad del jugador. Almacena recursos actuales (armas, munición, alcohol, dólares) y ubicación.
    - `habitacion_usuario`: Nivel actual de los edificios en una propiedad.
    - `entrenamiento_usuario`: Nivel de investigaciones del usuario (globales).
    - `tropa_propiedad`: Cantidad de tropas estacionadas en una propiedad.
    - `tropa_seguridad_propiedad`: Tropas asignadas a defensa.

### 2.3 Queues (Colas Asíncronas)
Mecanismo para manejar procesos que toman tiempo (construcción, viajes).

- **`cola_construccion`**: Edificios en proceso de mejora.
- **`cola_investigacion`**: Tecnologías siendo investigadas.
- **`cola_reclutamiento`**: Unidades militares en entrenamiento.
- **`cola_misiones`**: Movimientos de flota (ataques, transporte, espionaje). Gestiona tiempos de viaje.
- **`cola_eventos_flota`**: Eventos programados relacionados con flotas.

### 2.4 Social & Messaging
Interacción entre jugadores.

- **Familias (Clanes):**
    - `familia`: Datos de la alianza.
    - `miembro_familia`: Relación usuario-familia y roles.
    - `invitacion_familia`: Gestión de reclutamiento.
    - `anuncio_familia`: Tablón de anuncios interno.

- **Mensajería y Reportes:**
    - `mensaje`: Sistema de correo interno.
    - `informe_batalla`: Resultados detallados de combates.
    - `informe_espionaje`: Información obtenida de otros jugadores.
    - `ataque_entrante`: Alertas de ataques inminentes.

## 3. Seguridad (RLS)

Row Level Security (RLS) está habilitado en **todas** las tablas.

### Políticas Generales:
- **Lectura Pública:** Datos no sensibles como configuraciones (`configuracion_tropa`) o perfiles públicos (`usuario`).
- **Modificación Propia:** Los usuarios solo pueden modificar sus propios datos o los de sus propiedades.
- **Visibilidad por Contexto:**
    - `cola_construccion`: Solo visible si eres dueño de la propiedad.
    - `mensaje`: Visible solo para remitente y destinatario.
    - `familia`: Miembros pueden ver anuncios internos.

### Roles:
- **Sistema:** Funciones `SECURITY DEFINER` permiten realizar acciones privilegiadas (como deducir recursos) de forma controlada, saltándose RLS momentáneamente dentro de la función.
- **Familia:** Roles `lider`, `capitan`, `miembro` gestionados en la tabla `miembro_familia` controlan permisos administrativos dentro de la alianza.

## 4. Procedimientos Almacenados (RPC)

Las acciones críticas se exponen como funciones PostgreSQL llamables desde el cliente Supabase (`rpc()`).

### Principales Funciones:

- **Recursos:**
    - `materializar_recursos(propiedad_id)`: Calcula y actualiza los recursos generados desde la última interacción. Es el corazón del sistema "Lazy Update".

- **Gestión de Base:**
    - `crear_propiedad_inicial(...)`: Onboarding de nuevos usuarios.
    - `iniciar_construccion_habitacion(...)`: Valida recursos/requisitos y añade a la cola.
    - `iniciar_entrenamiento(...)`: Inicia investigación tecnológica.
    - `iniciar_reclutamiento(...)`: Comienza producción de tropas.
    - `procesar_colas()`: Función de mantenimiento para finalizar tareas completadas (llamada periódicamente o por triggers).

- **Usuarios:**
    - `handle_new_user()`: Trigger automático al registrarse en Auth para crear entrada en `public.usuario`.

## 5. Flujo de Datos Conceptual

1.  **Lectura:** El Cliente (Frontend) se suscribe a cambios en tiempo real o consulta tablas (`propiedad`, `cola_construccion`) directamente vía Supabase Client. RLS filtra los datos.
2.  **Acción:** El Usuario solicita una acción (ej: "Construir Edificio").
3.  **RPC:** El Cliente llama a una RPC (ej: `iniciar_construccion`).
4.  **Validación & Ejecución (DB):**
    - La RPC bloquea filas necesarias (prevención de Race Conditions).
    - Ejecuta `materializar_recursos` para tener saldos actualizados.
    - Verifica requisitos (costos, niveles previos).
    - Deduce recursos y actualiza estado o inserta en colas.
5.  **Confirmación:** La DB retorna éxito/error y datos actualizados.
6.  **Actualización UI:** El Cliente recibe la respuesta y/o la actualización en tiempo real y refresca la interfaz.
