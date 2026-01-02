# MMORTS Project - Technical Documentation

## 1. Visión General del Proyecto
Este proyecto es un **Juego de Estrategia en Tiempo Real Masivo (MMORTS)** con temática de Crimen Organizado (Mafia/Narcos). Los jugadores gestionan un imperio criminal, construyen bases, gestionan recursos, investigan tecnologías, reclutan tropas y participan en operaciones PvP/PvE.

La arquitectura está diseñada para ser **Serverless**, escalable y segura, delegando la "Verdad" del juego a la base de datos (PostgreSQL) y utilizando el Frontend (Next.js) principalmente como una interfaz de gestión y visualización.

## 2. Stack Tecnológico

### Frontend (Application Layer)
-   **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) - Renderizado híbrido (SSR/CSR).
-   **Lenguaje:** TypeScript - Tipado estricto para interfaces de juego y respuestas de BD.
-   **Estilos:** Tailwind CSS - Diseño utility-first rápido y responsivo.
-   **UI Components:** Shadcn/UI (Radix Primitives) - Componentes accesibles y personalizables.
-   **Gestión de Formularios:** React Hook Form + Zod.
-   **Visualización:** Recharts (Gráficos), Lucide React (Iconos).

### Backend (Data & Logic Layer)
-   **Plataforma:** [Supabase](https://supabase.com/).
-   **Base de Datos:** PostgreSQL.
-   **Autenticación:** Supabase Auth (Integración nativa con RLS).
-   **Lógica de Negocio:** PostgreSQL Functions (PL/pgSQL RPCs) & Triggers.
-   **Tiempo Real:** Supabase Realtime (Websockets para actualizaciones de UI).

### Infraestructura & Herramientas
-   **Runtime:** Bun (Recomendado) o Node.js.
-   **Validación de Esquema:** Zod (Server Actions).
-   **Linting/Formatting:** ESLint.

## 3. Arquitectura del Sistema

### Filosofía: "Database for Truth"
A diferencia de aplicaciones web tradicionales donde la lógica reside en el servidor API (Node/Python), aquí **la lógica crítica de juego vive en la Base de Datos**.
-   **Validación de Costos:** No se calcula en el cliente. Se llama a `iniciar_construccion_habitacion` (RPC) y la BD valida recursos y requisitos.
-   **Integridad:** Previene trampas y condiciones de carrera.

### Patrones Clave

1.  **Lazy Evaluation (Recursos):**
    No hay un proceso en segundo plano ("Ticker") actualizando los recursos de todos los jugadores cada segundo.
    *   **Fórmula:** `Stock Actual = Stock Guardado + (Tiempo Transcurrido * Tasa de Producción)`.
    *   Se ejecuta mediante la función `materializar_recursos()` cada vez que el usuario realiza una acción o carga el dashboard.

2.  **Colas Persistentes:**
    Construcciones, investigaciones y reclutamientos se almacenan en tablas (`cola_construccion`, etc.).
    *   No dependen de `setTimeout` en memoria.
    *   Sobreviven reinicios del servidor.

3.  **Seguridad (Row Level Security):**
    Todas las tablas tienen RLS activado.
    *   Los jugadores solo pueden leer/escribir sus propios datos.
    *   Las funciones RPC usan `SECURITY DEFINER` de forma controlada para modificar el estado global cuando es necesario.

## 4. Estructura del Proyecto

```bash
.
├── docs/                   # Documentación técnica, reportes y especificaciones
│   ├── agente/             # Prompts y definiciones de IA
│   └── reports/            # Auditorías de código y esquemas
├── scripts/                # Herramientas de análisis y mantenimiento
│   ├── analisis/           # Scripts Python para detectar duplicados y mapear componentes
│   └── exportador/         # Herramientas para extraer código fuente
├── src/
│   ├── app/                # Next.js App Router (Rutas y Páginas)
│   │   ├── (auth)/         # Rutas de autenticación (login, register)
│   │   ├── dashboard/      # Panel principal del juego (protegido)
│   │   └── api/            # Endpoints API (si aplica)
│   ├── components/         # Componentes React Reutilizables
│   │   ├── ui/             # Primitivas de Shadcn (Button, Card, etc.)
│   │   └── dashboard/      # Widgets de juego (ConstructionQueue, Resources, etc.)
│   ├── lib/                # Utilidades y Lógica Compartida
│   │   ├── actions/        # Server Actions (Next.js)
│   │   ├── services/       # Capa de servicio (GameService, AuthService)
│   │   ├── supabase/       # Clientes de Supabase (Server/Client)
│   │   └── utils.ts        # Helpers generales
│   └── types/              # Definiciones de Tipos TypeScript (DB Interfaces)
└── supabase/
    └── migrations/         # Archivos SQL versionados (Esquema y Lógica)
```

## 5. Integración Frontend-Backend

### Flujo de Datos
1.  **Hydration (Carga Inicial):**
    *   El Server Component (ej: `dashboard/page.tsx`) llama a `getDashboardData` (Service).
    *   El Service invoca el RPC `get_dashboard_data` en PostgreSQL.
    *   PostgreSQL procesa colas, materializa recursos y devuelve un JSON gigante con el estado actual.
    *   El Frontend renderiza la vista inicial con estos datos.

2.  **Interacción (Actions):**
    *   El usuario hace clic en "Construir".
    *   Se invoca una Server Action (`startConstructionAction`).
    *   La Action valida input con Zod y llama al RPC `iniciar_construccion_habitacion`.
    *   Si es exitoso, se usa `revalidatePath` para refrescar la UI.

3.  **Realtime (Actualización en Vivo):**
    *   El cliente se suscribe a cambios en tablas clave (`cola_construccion`, `propiedad`) vía Supabase Realtime.
    *   Al recibir un evento, la UI se actualiza sin recargar la página.

## 6. Configuración y Despliegue

### Requisitos Previos
*   Bun instalado (`curl -fsSL https://bun.sh/install | bash`).
*   Proyecto Supabase creado.

### Instalación
1.  Clonar repositorio.
2.  `bun install`
3.  Configurar `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
    ```

### Ejecución
*   **Desarrollo:** `bun run dev` (Puerto 9002)
*   **Verificación Tipos:** `bun run typecheck`
*   **Producción:** `bun run build && bun run start`

---
