🏗️ ESPECIFICACIÓN TÉCNICA: Optimización de Dashboard (Visión General)
Rol Asignado: Frontend Architect / Performance Specialist
Contexto: Se requiere modernizar la página principal (`/dashboard`) para seguir una estrategia de carga de datos paralela y componentes reactivos optimizados, similar a los estándares de "Command Center" de juegos de estrategia. El objetivo es minimizar el "Layout Shift" y mostrar datos críticos (recursos, ataques) lo más rápido posible.

🧠 Análisis de Contexto (Automático):
- **Ubicación:** `src/app/dashboard/overview/page.tsx` (o `src/app/dashboard/page.tsx`).
- **Datos Existentes:** `get_dashboard_data` (RPC) trae propiedad, recursos y edificios.
- **Datos Faltantes en RPC:** Ataques entrantes, Misiones activas, Info de Familia.

📦 ARCHIVOS A INTERVENIR
1.  `src/app/dashboard/overview/page.tsx` (Lógica de carga).
2.  `src/components/dashboard/overview/resource-ticker.tsx` (Nuevo componente).
3.  `src/lib/services/game.service.ts` (Nuevos métodos).
4.  `src/components/dashboard/overview/alerts-widget.tsx` (Nuevo componente).

🛠️ INSTRUCCIONES PASO A PASO (Atomizadas)

[Fase 1: Service Layer - Data Fetching]
Acción: Implementar métodos de obtención de datos segregados en `game.service.ts`.
Detalle:
- Crear `getIncomingAttacks(propiedadId)`: Consultar tabla `ataque_entrante` filtrando por `defensor_id` o propiedad.
- Crear `getActiveMissions(propiedadId)`: Consultar `cola_misiones` (flotas propias).
- Crear `getFamilyInfo(userId)`: Consultar tabla `miembro_familia` + `familia`.
- *Nota:* Mantener `getDashboardData` para el núcleo (recursos/edificios).

[Fase 2: Page Implementation - Parallel Fetching]
Acción: Refactorizar `src/app/dashboard/overview/page.tsx`.
Detalle:
- Usar `Promise.all` para la carga inicial server-side:
  ```typescript
  const [dashboardData, attacks, missions, family] = await Promise.all([
    getDashboardData(propertyId),
    getIncomingAttacks(propertyId),
    getActiveMissions(propertyId),
    getFamilyInfo(userId)
  ]);
  ```
- Pasar datos a componentes cliente.

[Fase 3: Frontend Components - Resource Ticker]
Acción: Crear `ResourceTicker`.
Detalle:
- Recibe: `initialValue`, `productionRate` (por hora o segundo), `lastUpdated` (timestamp).
- Lógica: Usar `useEffect` con `requestAnimationFrame` o `setInterval` (1s) para interpolar visualmente la cantidad actual.
- Fórmula: `Current = Initial + (SecondsElapsed * RatePerSecond)`.

[Fase 4: Frontend Components - Alerts Widget]
Acción: Crear Widget de Alertas.
Detalle:
- Si `attacks.length > 0`: Mostrar banner rojo parpadeante con cuenta regresiva al ataque más próximo.
- Si no hay ataques: Mostrar estado "Seguro" (Verde).

✅ CRITERIOS DE ACEPTACIÓN
- La carga de la página debe ocurrir en un solo bloque de espera (Promise.all).
- Los recursos deben incrementarse visualmente en tiempo real sin recargar la página.
- Las alertas de ataque deben ser visibles inmediatamente si existen.

🛡️ REGLAS DE ORO
Runtime: Bun.
State Management: Usar Server Components para la carga inicial, Client Components para la interactividad (Tickers).
Performance: No hacer polling agresivo. Usar Realtime (Supabase) para actualizaciones posteriores a la carga inicial (Fase futura, pero preparar estructura).
