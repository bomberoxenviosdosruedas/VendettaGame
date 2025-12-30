# Guía de Desarrollo del Proyecto Vendetta

Este documento describe las convenciones y mejores prácticas a seguir para el desarrollo de este proyecto, asegurando consistencia y mantenibilidad del código.

## 1. Estructura de Archivos

El proyecto sigue una estructura basada en funcionalidades, principalmente dentro del directorio `src`.

-   **Páginas Principales**: Se encuentran en `src/app`.
    -   **Autenticación**: Las páginas relacionadas con la autenticación (login, signup, etc.) están en `src/app/(auth)/`.
    -   **Dashboard**: Las páginas principales de la aplicación después de iniciar sesión se encuentran dentro de `src/app/dashboard/`. Cada página principal debe tener su propia carpeta (ej. `src/app/dashboard/rooms/`).

-   **Componentes**:
    -   **Componentes de UI Reutilizables**: Los componentes de UI genéricos (basados en shadcn/ui) como `Button`, `Card`, `Input`, etc., se encuentran en `src/components/ui/`.
    -   **Componentes Específicos de Página**: Los componentes que son específicos de una página deben ser creados dentro del directorio de esa página. Por ejemplo, `RoomCard` para la página de "Habitaciones" se encuentra en `src/app/dashboard/rooms/room-card.tsx`.

-   **Datos Estáticos**:
    -   La información estática o mock data para una página debe estar en un archivo separado dentro de la misma carpeta de la página. Ejemplo: `src/app/dashboard/rooms/rooms-data.ts`.
    -   Los datos de imágenes placeholder se gestionan centralmente en `src/lib/placeholder-images.json`.

-   **Lógica y Utilidades**:
    -   **Supabase**: La configuración del cliente y servidor de Supabase se encuentra en `src/lib/supabase/`.
    -   **Acciones de Servidor**: Las acciones relacionadas con la autenticación están en `src/app/auth/actions.ts`.
    -   **Utilidades Generales**: Funciones de ayuda como `cn` están en `src/lib/utils.ts`.

-   **Imágenes y Assets**:
    -   Las imágenes estáticas se almacenan en la carpeta `public/img/` y se organizan en subdirectorios por categoría (ej. `hab`, `trop`, `train`).

## 2. Creando una Nueva Página del Dashboard

Cuando necesites añadir una nueva sección al dashboard (ej. "Mercado"):

1.  **Crear Carpeta**: Crea una nueva carpeta en `src/app/dashboard/`, por ejemplo, `src/app/dashboard/market/`.

2.  **Crear `page.tsx`**: Dentro de la nueva carpeta, crea el archivo `page.tsx`. Este será el punto de entrada para tu nueva ruta.

    ```tsx
    // src/app/dashboard/market/page.tsx
    import { MarketHeader } from './market-header';
    import { MarketTable } from './market-table';

    export default function MarketPage() {
      return (
        <div className="space-y-4">
          <MarketHeader />
          <MarketTable />
        </div>
      );
    }
    ```

3.  **Crear Componentes Específicos**: Divide la página en componentes más pequeños y específicos. Por ejemplo, `market-header.tsx` y `market-table.tsx` dentro de `src/app/dashboard/market/`.

4.  **Manejar Datos**: Si la página utiliza datos estáticos, crea un archivo `market-data.ts` en la misma carpeta.

    ```ts
    // src/app/dashboard/market/market-data.ts
    export type MarketItem = {
      id: string;
      resource: string;
      quantity: number;
      price: number;
    };

    export const marketData: MarketItem[] = [
      // ... datos del mercado
    ];
    ```

5.  **Añadir Enlace en la Navegación**: No olvides añadir el enlace a la nueva página en el menú de navegación lateral, ubicado en `src/app/dashboard/side-nav.tsx`.

## 3. Estilo y Diseño

-   **Framework**: Utilizamos **Tailwind CSS** para el estilizado.
-   **Componentes de UI**: Preferimos usar componentes de **shadcn/ui** que se encuentran en `src/components/ui/`. Si necesitas un componente nuevo y reutilizable, considera si puede ser una extensión de uno existente.
-   **Tema**: Los colores y variables de estilo principales se definen en `src/app/globals.css` utilizando variables CSS de HSL para facilitar la tematización. Evita usar colores "mágicos" (ej. `text-red-500`) y en su lugar, utiliza las variables del tema (`primary`, `secondary`, `accent`, `destructive`, etc.).

## 4. Imágenes

-   Las imágenes estáticas del juego deben colocarse en `public/img/` y referenciarse con una ruta relativa (ej. `/img/hab/room-office.webp`).
-   Todas las imágenes utilizadas en la aplicación deben tener una entrada correspondiente en `src/lib/placeholder-images.json`. Esto centraliza la gestión de metadatos de imágenes.

Siguiendo estas directrices, mantendremos un proyecto limpio, organizado y fácil de escalar. ¡A codificar!

## 5. Protocolo de Integración Frontend-Backend

Este protocolo formaliza el trabajo para conectar la base de datos Supabase (SQL) con el frontend Next.js (TSX), asegurando consistencia y calidad.

### 5.1. Fase de Análisis (Lectura SQL)
Antes de escribir código, **leer los archivos de migración** en `supabase/migrations/`.
- **Tablas:** Definir interfaces TypeScript.
- **RPCs (Functions):** Entender argumentos y retornos (mapear JSON a interfaces).
- **Enums:** Crear tipos unión en TypeScript.
- **RLS Policies:** Comprender permisos para manejar estados de UI.

### 5.2. Fase de Implementación

**A. Capa de Tipos (TypeScript)**
- Generar/actualizar interfaces en `src/types/` reflejando fielmente la DB.
- Mantener convención de nombres consistente o usar mapeadores.

**B. Capa de Servicio (Server Actions - `src/lib/actions/`)**
- Funciones asíncronas con `"use server"`.
- Instanciar cliente Supabase (`createClient()`).
- **Validación:** Usar **Zod** para validar entradas ANTES de llamar a la DB.
- **Manejo de Errores:** Capturar errores y devolver objetos de estado claros (ej: `{ success: false, error: "..." }`).

**C. Capa de UI (Componentes)**
- **Lectura:** Priorizar Server Components.
- **Interactividad:** Client Components para formularios/botones que invocan Server Actions.
- **Feedback:** Implementar estados de `loading`, `success`, y `error`.
