# Análisis Detallado de Páginas 2025 (Especificación Técnica)

**Rol:** Solutions Architect / Legacy Business Analyst  
**Fecha:** 26/02/2025  
**Fuente:** Legacy Codebase (PHP/ZF1) & Modern Schema (PostgreSQL/Supabase)

Este documento detalla la especificación técnica para la migración de cada página del sistema heredado `Mob` al nuevo stack Next.js + Supabase, utilizando estrictamente el nuevo esquema de base de datos en español.

---

## 1. Dashboard / Visión General

### 1.1 Resumen del Imperio (Dashboard)
*   **Ruta Legacy:** `/mob/visiongeneral/index`
*   **Ruta Modern:** `/dashboard/overview`
*   **Nombre Funcional:** Panel de Control Principal

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   **Resumen de Recursos:** Tabla o Tarjetas mostrando Armas, Munición, Alcohol y Dólares actuales de la *base seleccionada*.
    *   **Noticias del Servidor:** Bloque de texto con anuncios administrativos (json/config).
    *   **Estado de Colas:** Resumen rápido de construcciones, investigaciones o reclutamientos en curso.
    *   **Ataques Entrantes:** ¡CRÍTICO! Alerta visual roja parpadeante si hay misiones de ataque hostil en camino (`#trp_ataques#`).
    *   **Selector de Base:** Menú desplegable para cambiar el contexto de la base activa (si tiene múltiples).
*   **Interacciones:**
    *   Cambiar de base (actualiza el contexto global).
    *   Clic en alertas de ataque (lleva a `/dashboard/fleet`).
    *   Clic en items de cola (lleva a la página respectiva).
*   **Componentes React Sugeridos:**
    *   `ResourceSummaryCard`: Muestra recursos con iconos.
    *   `ActiveQueueWidget`: Lista compacta de procesos activos.
    *   `IncomingAttackAlert`: Componente de alerta crítica.
    *   `ServerNewsFeed`: Renderiza noticias desde tabla o config.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Debe calcular la producción en tiempo real (o estimarla) basada en la última actualización.
    *   Debe verificar si hay misiones tipo 'ataque' dirigidas al usuario.
*   **Datos Necesarios (Lectura):**
    *   `propiedades` (recursos, coordenadas).
    *   `cola_construccion`, `cola_investigacion`, `cola_reclutamiento` (para widgets).
    *   `movimientos_mapa` (filtrar por `destino_propiedad_id` = usuario actual AND `tipo_mision` = 'ataque').
*   **Acciones (Escritura):**
    *   Ninguna directa en esta vista (lectura masiva).

#### Mapeo de Base de Datos
*   **Tablas:** `public.propiedades`, `public.movimientos_mapa`.
*   **Campos Críticos:** `propiedades.recursos_*`, `propiedades.ultima_actualizacion`.

---

### 1.2 Matriz Global de Recursos (Vision Global)
*   **Ruta Legacy:** `/mob/visionglobal/index`
*   **Ruta Modern:** `/dashboard/overview/matrix`
*   **Nombre Funcional:** Matriz de Producción del Imperio

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Tabla ancha (Matrix) donde:
        *   **Filas:** Cada base del jugador.
        *   **Columnas:** Coordenadas, Producción de cada recurso (Armas/h, Munición/h, etc.), Total almacenado.
    *   **Totales:** Fila final sumando la producción total del imperio.
*   **Interacciones:**
    *   Clic en una base para navegar a ella y establecerla como activa.
*   **Componentes React Sugeridos:**
    *   `EmpireResourceMatrix`: Tabla densa (shadcn/ui Data Table).

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Iterar sobre todas las propiedades del `perfil_id`.
    *   Calcular tasas de producción dinámicas basadas en niveles de edificios (`configuracion_edificios` + `edificios.nivel`).
*   **Datos Necesarios:**
    *   `propiedades`, `edificios` (join `configuracion_edificios`).

#### Mapeo de Base de Datos
*   **Tablas:** `public.propiedades`, `public.edificios`.

---

### 1.3 Matriz Global de Tropas
*   **Ruta Legacy:** `/mob/visionglobal/tropas`
*   **Ruta Modern:** `/dashboard/army/overview`
*   **Nombre Funcional:** Resumen Militar Global

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Tabla pivote similar a recursos pero para unidades militares.
    *   **Filas:** Bases.
    *   **Columnas:** Tipos de unidad (Matón, Portero, Espía, etc.).
    *   **Celdas:** Cantidad de unidades en esa base.
*   **Componentes React Sugeridos:**
    *   `TroopDistributionTable`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Sumarizar conteos de la tabla `tropas` agrupados por `propiedad_id` y `tropa_id`.
*   **Datos Necesarios:**
    *   `tropas`, `configuracion_tropas` (para nombres).

#### Mapeo de Base de Datos
*   **Tablas:** `public.tropas`.
*   **Campos Críticos:** `tropas.cantidad`, `tropas.tropa_id`.

---

## 2. Gestión del Imperio

### 2.1 Gestor de Recursos (Producción)
*   **Ruta Legacy:** `/mob/recursos/index`
*   **Ruta Modern:** `/dashboard/resources`
*   **Nombre Funcional:** Configuración de Energía/Recursos

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Lista de edificios productivos (Armería, Munición, Cervecería, etc.).
    *   Sliders o Inputs de porcentaje (0% a 100%) para ajustar nivel de producción (Gestión de energía/personal).
    *   Indicador de "Estado de Almacenes" (lleno/vacío).
    *   Botón "Calcular" o "Guardar Cambios".
*   **Interacciones:**
    *   Ajustar porcentaje de producción por edificio (bajar producción si falta energía/dinero, aunque en Vendetta el concepto de energía es menos prominente, suele ser gestión de consumo).
*   **Componentes React Sugeridos:**
    *   `ProductionSlider`, `ResourceEfficiencyChart`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Modificar el factor de producción de los edificios. (Nota: El esquema actual simplificado no muestra un campo de 'porcentaje' en `edificios`, si esta feature es crítica, se debe añadir metadatos a la tabla `edificios` o asumir 100%).
    *   *Nota Migración:* Si el legacy permite apagar edificios, añadir columna `activo` o `factor_produccion` a `public.edificios`. Por defecto asumir 100%.

#### Mapeo de Base de Datos
*   **Tablas:** `public.edificios`, `public.propiedades`.

---

### 2.2 Constructor de Edificios (Habitaciones)
*   **Ruta Legacy:** `/mob/habitaciones/index` (y `/mob/edificios/index`)
*   **Ruta Modern:** `/dashboard/buildings`
*   **Nombre Funcional:** Arquitecto de Base

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Lista de edificios disponibles para construir/ampliar.
    *   Requisitos visuales (Costo vs Recursos actuales, Tech requerida).
    *   Botón "Ampliar a Nivel X" (Verde si posible, Rojo/Gris si no).
    *   Cola de construcción activa con cuenta regresiva.
*   **Interacciones:**
    *   Iniciar construcción (Insertar en cola).
    *   Cancelar construcción (Borrar de cola, reembolsar parcial).
*   **Componentes React Sugeridos:**
    *   `BuildingCard` (Imagen, Nivel, Costo).
    *   `ConstructionQueue` (Timer en tiempo real).

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Verificar recursos suficientes en `propiedades`.
    *   Verificar requisitos previos (ej: Oficina Nivel 3 para construir Escuela).
    *   Verificar espacio en cola (máx 5 slots).
    *   Al iniciar: Restar recursos, crear entrada en `cola_construccion`.
*   **Acciones (Escritura):**
    *   RPC: `construir_edificio(propiedad_id, edificio_id)`.
    *   RPC: `cancelar_construccion(cola_id)`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.edificios`, `public.cola_construccion`, `public.configuracion_edificios`.

---

### 2.3 Árbol Tecnológico (Investigación)
*   **Ruta Legacy:** `/mob/arboltecnologico/index`
*   **Ruta Modern:** `/dashboard/tech-tree` (Referencia visual)
*   **Nombre Funcional:** Visualizador de Requisitos

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Grafo o lista jerárquica mostrando dependencias.
    *   Visualización de qué desbloquea qué (ej: Escuela -> Matón).
    *   Estado: "Desbloqueado" (Verde), "Bloqueado" (Rojo).
*   **Interacciones:**
    *   Solo lectura/navegación. Clic en un item lleva a su página de construcción/entrenamiento.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Comparar niveles actuales (`edificios`, `investigaciones`) contra requisitos JSON/Config.
*   **Datos Necesarios:**
    *   Niveles actuales del usuario.

#### Mapeo de Base de Datos
*   **Tablas:** `public.edificios`, `public.investigaciones`.

---

### 2.4 Centro de Investigación (Entrenamiento)
*   **Ruta Legacy:** `/mob/entrenamiento/index`
*   **Ruta Modern:** `/dashboard/research`
*   **Nombre Funcional:** Laboratorio de I+D

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Similar a Edificios, pero para Tecnologías (Espionaje, Combate, etc.).
    *   Muestra nivel actual de investigación.
    *   Cola de investigación (suele ser única por usuario o por base, según legacy).
*   **Interacciones:**
    *   "Investigar" (Inicia timer).
*   **Componentes React Sugeridos:**
    *   `ResearchCard`, `ResearchQueue`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Requiere edificio base (ej: Escuela/Laboratorio).
    *   Cola de investigación global o por base (verificar legacy, usualmente vinculada al usuario).
*   **Acciones:**
    *   RPC: `iniciar_investigacion(perfil_id, investigacion_id)`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.investigaciones`, `public.cola_investigacion`, `public.configuracion_investigaciones`.

---

### 2.5 Mercado Negro
*   **Ruta Legacy:** `/mob/mercado/index`
*   **Ruta Modern:** `/dashboard/market`
*   **Nombre Funcional:** Lonja de Comercio

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   **Pestaña Comprar:** Lista de ofertas de otros jugadores. Filtros por recurso.
    *   **Pestaña Vender:** Formulario para crear una oferta (Vendo X Armas, Pido Y Dólares).
    *   **Mis Ofertas:** Lista de ofertas activas propias con opción de cancelar.
*   **Interacciones:**
    *   Aceptar oferta (Transacción inmediata si hay recursos de transporte o magia de mercado).
    *   Crear oferta.
*   **Componentes React Sugeridos:**
    *   `MarketOfferTable`, `CreateOfferForm`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Al crear oferta: Los recursos se "reservan" (restan) del almacén.
    *   Al cancelar: Se devuelven.
    *   Al comprar: Se restan recursos del comprador y se inicia transferencia (o instantánea según diseño simplificado).
*   **Acciones:**
    *   RPC: `publicar_oferta(...)`.
    *   RPC: `aceptar_oferta(oferta_id)`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.ofertas_mercado`.

---

## 3. Militar

### 3.1 Reclutamiento (Ofensivo)
*   **Ruta Legacy:** `/mob/reclutamiento/index`
*   **Ruta Modern:** `/dashboard/army/recruit`
*   **Nombre Funcional:** Cuartel / Campo de Entrenamiento

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Lista de unidades ofensivas (Matón, Pistolero, etc.).
    *   Input numérico para cantidad a entrenar.
    *   Botón "Entrenar" (Añade a cola).
    *   Cola de reclutamiento (lote por lote).
*   **Componentes React Sugeridos:**
    *   `UnitRecruitmentRow`, `RecruitmentQueue`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Requiere edificio 'Campo de Entrenamiento'.
    *   Verificar recursos totales = Costo unitario * Cantidad.
*   **Acciones:**
    *   RPC: `reclutar_tropas(propiedad_id, tropa_id, cantidad)`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.tropas`, `public.cola_reclutamiento`, `public.configuracion_tropas` (tipo='ataque').

### 3.2 Seguridad (Defensivo)
*   **Ruta Legacy:** `/mob/seguridad/index`
*   **Ruta Modern:** `/dashboard/army/defense`
*   **Nombre Funcional:** Perímetro Defensivo

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Idéntico a Reclutamiento pero para unidades defensivas (Torretas, Minas, Porteros).
    *   Diferenciación visual (quizás tono azul/escudo vs rojo/espada).

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Requiere edificio 'Seguridad'.
*   **Mapeo:** Igual a Reclutamiento pero filtrando `configuracion_tropas` donde `tipo='defensa'`.

---

## 4. Flotas y Mapa

### 4.1 Centro de Misiones (Flota)
*   **Ruta Legacy:** `/mob/misiones/index`
*   **Ruta Modern:** `/dashboard/fleet`
*   **Nombre Funcional:** Coordinador de Movimientos

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   **Paso 1: Selección de Tropas.** Lista con inputs max/min para seleccionar qué enviar.
    *   **Paso 2: Coordenadas.** Inputs X:Y:Z. Selector de velocidad (10%-100%).
    *   **Paso 3: Misión y Carga.** Radio buttons (Atacar, Transportar, Espiar, Ocupar). Sliders para cargar recursos en las naves/tropas.
    *   **Resumen:** Tiempo de vuelo, consumo de combustible.
*   **Interacciones:**
    *   Wizard de 3 pasos o formulario SPA complejo.
*   **Componentes React Sugeridos:**
    *   `FleetDispatcher` (Stepper component).
    *   `TroopSelector`, `CoordinateInput`, `MissionTypeSelector`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Validar capacidad de carga (Recursos vs Capacidad Tropas).
    *   Validar coordenadas válidas (dentro del sistema/galaxia).
    *   Calcular tiempo de vuelo (Fórmula de distancia).
*   **Acciones:**
    *   RPC: `enviar_flota(payload_json)`. Este RPC es complejo, debe insertar en `movimientos_mapa` y restar tropas de `tropas`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.movimientos_mapa`, `public.tropas`, `public.propiedades`.

### 4.2 Mapa de la Galaxia
*   **Ruta Legacy:** `/mob/mapa/index`
*   **Ruta Modern:** `/dashboard/map`
*   **Nombre Funcional:** Astrogator / Callejero

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Grilla 15x17 (o similar) mostrando el vecindario de coordenadas.
    *   Celdas ocupadas muestran: Nombre jugador, Alianza, Icono (Vacaciones/Noob/Fuerte).
    *   Celdas vacías: Opción "Colonizar/Ocupar" (si aplica).
    *   Navegación: Flechas para moverse de Sistema/Galaxia.
*   **Interacciones:**
    *   Clic en planeta/base -> Menú contextual (Espiar, Atacar, Enviar Mensaje).
*   **Componentes React Sugeridos:**
    *   `GalaxyGrid`, `MapSystemNavigator`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Consulta espacial eficiente. Buscar propiedades donde `coord_x` y `coord_y` coincidan con la vista actual.
*   **Datos Necesarios:**
    *   `propiedades` (coords, usuario, alianza).

#### Mapeo de Base de Datos
*   **Tablas:** `public.propiedades` JOIN `public.perfiles` JOIN `public.alianzas`.

---

## 5. Social

### 5.1 Mensajería
*   **Ruta Legacy:** `/mob/mensajes/index`
*   **Ruta Modern:** `/dashboard/messages`
*   **Nombre Funcional:** Centro de Comunicaciones

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Bandeja de Entrada / Salida.
    *   Lista de mensajes (Remitente, Asunto, Fecha).
    *   Lectura de mensaje (modal o página detalle).
    *   Redacción (Destinatario autocompletable).
*   **Componentes React Sugeridos:**
    *   `InboxTable`, `MessageComposer`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Mensajes de sistema (ID 0) vs Jugadores.
    *   Marcar como leído al abrir.
*   **Acciones:**
    *   RPC: `enviar_mensaje(...)`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.mensajes`.

### 5.2 Alianza (Familias)
*   **Ruta Legacy:** `/mob/familias/index`
*   **Ruta Modern:** `/dashboard/alliance`
*   **Nombre Funcional:** Sindicato / Facción

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   **Si no tiene:** Botones "Buscar Alianza" o "Fundar Alianza".
    *   **Si tiene:**
        *   Muro de la alianza (Descripción interna, logo).
        *   Lista de miembros (Rangos, Estado Online/Offline).
        *   Administración (si es líder): Gestionar solicitudes, editar texto, declarar guerras.
        *   Diplomacia: Ver guerras activas y pactos.
*   **Componentes React Sugeridos:**
    *   `AllianceDashboard`, `MemberList`, `WarRoom`.

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Gestión de permisos basada en rangos (Leader, Co-Leader, Member).
*   **Datos Necesarios:**
    *   `alianzas`, `miembros_alianza`, `solicitudes_alianza`, `guerras`.

#### Mapeo de Base de Datos
*   **Tablas:** `public.alianzas`, `public.miembros_alianza`, `public.guerras`.

### 5.3 Clasificación (Ranking)
*   **Ruta Legacy:** `/mob/clasificacion/index`
*   **Ruta Modern:** `/dashboard/ranking`
*   **Nombre Funcional:** Hall de la Fama

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Tabla paginada (1-100, 101-200...).
    *   Filtros: Jugadores vs Alianzas.
    *   Columnas: Posición, Nombre, Alianza, Puntos, Acciones (Mensaje).
    *   Resaltado del usuario actual.
*   **Componentes React Sugeridos:**
    *   `RankingTable` (Virtualizada si son muchos, o paginada server-side).

#### Lógica de Negocio (Backend/RPC)
*   **Reglas:**
    *   Los puntos se calculan periódicamente (Job programado) o via triggers. El esquema tiene campos `puntos_*` en `perfiles` y `alianzas`.
*   **Datos Necesarios:**
    *   `perfiles` (ordenados por `puntos_total`).

#### Mapeo de Base de Datos
*   **Tablas:** `public.perfiles`, `public.alianzas`.

---

## 6. Opciones y Configuración

### 6.1 Ajustes de Cuenta
*   **Ruta Legacy:** `/mob/opciones/index`
*   **Ruta Modern:** `/dashboard/settings`
*   **Nombre Funcional:** Configuración de Usuario

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Cambio de Avatar/Logo.
    *   Modo Vacaciones (Checkbox + fecha fin).
    *   Cambio de Contraseña (Manejado por Supabase Auth).
    *   Borrar Cuenta (Zona de Peligro).
*   **Lógica de Negocio:**
    *   Vacaciones: Detiene producción y ataques, pero requiere no tener misiones activas.
*   **Mapeo de Base de Datos:**
    *   `public.perfiles` (`vacaciones`, `avatar_url`).

---

## 7. Informes de Batalla (Batallas)
*   **Ruta Legacy:** `/mob/batallas/index`
*   **Ruta Modern:** `/dashboard/reports`
*   **Nombre Funcional:** Archivos de Guerra

#### Análisis de Frontend (UX/UI)
*   **Elementos Clave:**
    *   Lista de reportes (Fecha, Atacante vs Defensor, Ganador, Botín).
    *   Detalle (Vista HTML compleja del combate ronda por ronda).
*   **Lógica de Negocio:**
    *   Los reportes se generan al resolver un combate (`movimientos_mapa` llega a destino).
    *   Se almacenan estáticamente (JSONB) para consulta histórica.
*   **Mapeo de Base de Datos:**
    *   `public.batallas` (`detalle_log` jsonb).

---
