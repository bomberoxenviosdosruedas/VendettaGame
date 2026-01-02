# AGENTS.MD - Guía de Desarrollo para Agentes de IA

Este archivo sirve como la fuente de verdad y guía maestra para cualquier agente de IA (como Jules, GitHub Copilot, Cursor, etc.) que trabaje en el repositorio **Vendetta Games**.

## 1. Visión General del Proyecto

**Vendetta Games** es una aplicación web full-stack construida con una arquitectura moderna y robusta.

### Pila Tecnológica
*   **Frontend:** Next.js 15+ (App Router), React 19, Tailwind CSS, Lucide React, Shadcn/UI (Radix primitives).
*   **Backend:** Next.js Server Actions, Supabase (PostgreSQL, Auth, Realtime, Storage).
*   **Runtime:** Bun (para gestión de paquetes y ejecución de scripts).
*   **Lenguaje:** TypeScript (Estricto).
*   **Validación:** Zod.

## 2. Filosofía Arquitectónica

**"Base de Datos para la Verdad, TypeScript para la Gestión"**

*   **La Base de Datos es la Autoridad:** La integridad de los datos, las restricciones (constraints) y la lógica de negocio crítica (como la creación de usuarios o movimientos de inventario complejos) deben residir en la base de datos a través de **Tablas, RLS Policies, Triggers y Funciones RPC**.
*   **TypeScript es el Orquestador:** El código TypeScript (Server Actions) gestiona el flujo, valida las entradas del usuario y llama a las funciones de la base de datos. No debe intentar replicar la lógica que ya existe en SQL (ej: no calcular balances manualmente si un RPC lo hace).

## 3. Reglas de la Base de Datos (Supabase/PostgreSQL)

1.  **Inmutabilidad de Migraciones:** **NUNCA** modifiques un archivo de migración existente en `supabase/migrations/` una vez que ha sido aplicado o compartido.
2.  **Cambios Incrementales:** Para cualquier cambio en el esquema o lógica, crea un **nuevo** archivo de migración con el timestamp actual (ej: `20250220_120000_descripcion.sql`).
3.  **Idempotencia:** Todas las migraciones deben ser idempotentes.
    *   Usa `CREATE OR REPLACE FUNCTION`.
    *   Usa `DROP TRIGGER IF EXISTS` antes de crear uno nuevo.
    *   Usa `CREATE TABLE IF NOT EXISTS` (aunque preferiblemente gestiona las tablas con cuidado).
4.  **Seguridad (RLS):** Todas las tablas deben tener RLS (Row Level Security) habilitado. Las políticas deben ser explícitas.
5.  **Exposición:** Prefiere exponer lógica compleja a través de **RPCs** (Remote Procedure Calls) en lugar de consultas directas complejas desde el cliente.

## 4. Reglas del Backend (Next.js / Server Actions)

1.  **Ubicación:** Las Server Actions residen en `src/actions/` (o `src/lib/actions/` si se migra). *Nota: Actualmente se encuentran en `src/actions/`.*
2.  **Directiva:** Deben incluir siempre `'use server'` al inicio del archivo.
3.  **Validación Estricta:**
    *   Toda entrada de una Server Action debe ser validada con **Zod** antes de hacer nada más.
    *   Si la validación falla, devuelve un error estructurado, no lances una excepción no controlada.
4.  **Autenticación:**
    *   Verifica la sesión del usuario al inicio de la acción usando `auth.service.ts` o las utilidades de Supabase.
    *   No confíes en datos enviados por el cliente sobre la identidad del usuario (ej: `user_id` en el body); usa el ID de la sesión extraído del token.
5.  **Servicios:** Utiliza la capa de servicios en `src/lib/services/` para encapsular llamadas a la BD y lógica reutilizable.

## 5. Reglas del Frontend (React / Tailwind CSS)

1.  **Componentes:**
    *   Ubicación: `src/components/`.
    *   Prefiere **Server Components** por defecto. Usa `'use client'` solo cuando sea necesario (estado, efectos, interactividad).
2.  **Estilos:**
    *   Usa **Tailwind CSS** para todo el estilizado.
    *   **Mobile-First:** Escribe las clases base para móviles y usa modificadores (`sm:`, `md:`, `lg:`) para pantallas más grandes.
    *   Ejemplo: `className="w-full p-4 md:w-1/2 md:p-8"`
3.  **Integración:**
    *   Los componentes de cliente llaman a Server Actions para mutaciones.
    *   Maneja estados de carga (`isPending`) y error (`useFormState` o similar) para dar feedback al usuario.

## 6. Convenciones de Código y Archivos

1.  **Alias de Ruta:** Usa siempre `@/` para importar desde `src/` (ej: `import { Button } from '@/components/ui/button'`). Evita rutas relativas largas (`../../../`).
2.  **Nombres:**
    *   Archivos y directorios: `kebab-case` (ej: `user-profile.tsx`).
    *   Componentes: `PascalCase` (ej: `UserProfile`).
    *   Funciones y variables: `camelCase`.
    *   Tablas SQL: `snake_case`.

## 7. Protocolo de Verificación

Dado que no hay un suite de tests automatizados completo (`npm test` no está configurado o es básico):

1.  **Verificación Manual:** Tras realizar cambios, verifica el flujo manualmente iniciando el servidor:
    ```bash
    npm run dev
    ```
2.  **Compilación:** Asegúrate de que no hay errores de tipo ejecutando:
    ```bash
    npm run typecheck
    ```
    (o `tsc --noEmit`).
3.  **Evidencia:** Si realizas cambios en la UI, genera o solicita ver una captura de pantalla para confirmar la alineación y el estilo.

---
