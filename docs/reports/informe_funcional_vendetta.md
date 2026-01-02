# Manual de Referencia Funcional: Vendetta

**Versión:** 1.0
**Rol:** Guía Oficial de Diseño
**Objetivo:** Documentar exhaustivamente las mecánicas, entidades y flujos del juego sin referencias técnicas de implementación.

---

## 1. Introducción
**Vendetta** es un juego de estrategia masivo en tiempo real (MMORTS) ambientado en el submundo de la mafia. Los jugadores asumen el rol de un "Capo" que gestiona una propiedad clandestina, expandiendo su influencia mediante la gestión económica, el desarrollo de infraestructura, la investigación tecnológica y el conflicto militar contra otros jugadores.

El tiempo en el juego transcurre de manera continua y persistente, incluso cuando el jugador no está conectado.

---

## 2. Economía y Recursos
El motor económico se basa en cuatro pilares fundamentales. La gestión eficiente de estos recursos es la clave para la expansión.

### Recursos Militares (Producción Local)
Estos recursos son necesarios para la construcción de edificios y el reclutamiento de tropas.
*   **Armas:** El recurso básico de construcción y combate.
    *   *Producido en:* Armería.
    *   *Almacenado en:* Almacén de Armas (aumenta capacidad).
*   **Munición:** Recurso de alto consumo para tropas y ciertas estructuras defensivas.
    *   *Producido en:* Almacén de Munición (Fábrica).
    *   *Almacenado en:* Depósito de Munición (aumenta capacidad).

### Recursos Económicos (Comercio y Lujo)
*   **Alcohol:** Recurso de contrabando. Es vital para unidades avanzadas y operaciones especiales.
    *   *Producido en:* Cervecería.
    *   *Almacenado en:* Almacén de Alcohol.
*   **Dólares:** La divisa del juego. Se utiliza para espionaje, sobornos (unidades especiales) y mantenimiento.
    *   *Generado por:* Conversión de alcohol o misiones de extorsión.
    *   *Protegido por:* Caja Fuerte (evita que sea robado en ataques enemigos).

---

## 3. Infraestructura (Habitaciones)
La base de operaciones se divide en "Habitaciones". Cada una cumple una función específica y puede ser "Ampliada" para mejorar su eficiencia.

### Gestión y Mando
| Habitación | Función | Dependencias |
| :--- | :--- | :--- |
| **Oficina del Jefe** | Centro neurálgico. Su nivel reduce el tiempo de construcción de todos los demás edificios. | Ninguna |
| **Escuela de Especialización** | Centro de investigación (I+D). Permite desarrollar nuevos entrenamientos. | Ninguna |

### Producción y Almacenamiento
| Habitación | Función | Dependencias |
| :--- | :--- | :--- |
| **Armería** | Produce Armas. | Ninguna |
| **Almacén de Armas** | Aumenta la capacidad máxima de Armas. | Armería (Nvl 5) |
| **Almacén de Munición** | Produce Munición. | Ninguna |
| **Depósito de Munición** | Aumenta la capacidad máxima de Munición. | Almacén de Munición (Nvl 5) |
| **Cervecería** | Produce Alcohol. | Ninguna |
| **Almacén de Alcohol** | Aumenta la capacidad máxima de Alcohol. | Cervecería (Nvl 5) |
| **Caja Fuerte** | Protege un porcentaje de Dólares ante saqueos. | Taberna (Nvl 5) |

### Social y Militar
| Habitación | Función | Dependencias |
| :--- | :--- | :--- |
| **Taberna** | Centro de operaciones clandestinas. Necesaria para ciertos tratos. | Cervecería (Nvl 1) |
| **Campo de Entrenamiento** | Barracas. Permite reclutar tropas. A mayor nivel, recluta más rápido. | Ninguna |
| **Seguridad** | Sistema defensivo pasivo. Mejora la defensa base. | Campo de Entrenamiento (Nvl 2) |
| **Contrabando** | Centro logístico avanzado. | Oficina (Nvl 5) + Cervecería (Nvl 8) |

### Defensas Estáticas
| Habitación | Función | Dependencias |
| :--- | :--- | :--- |
| **Torreta de Fuego Automático** | Defensa de alto daño contra invasiones. | Oficina (Nvl 5) |
| **Minas Ocultas** | Trampa defensiva de un solo uso (concepto). | Oficina (Nvl 5) |

---

## 4. Fuerzas Armadas (Tropas)
El brazo armado de la organización. Se reclutan en el *Campo de Entrenamiento* y consumen recursos.

### Unidades de Apoyo
*   **Porteador:** Civil reclutado para carga.
    *   *Rol:* Transporte de recursos y saqueo.
    *   *Combate:* Nulo (0 Ataque / 0 Defensa).
    *   *Capacidad:* Muy Alta (1000u).


### Infantería
*   **Matón:** La fuerza bruta básica.
    *   *Rol:* Carne de cañón. Ataque y defensa balanceados bajos.
    *   *Uso:* Ataques masivos iniciales.
*   **Asesino:** Especialista ofensivo.
    *   *Rol:* Daño puro. Ataque alto, defensa baja.
    *   *Uso:* Romper defensas enemigas rápidamente.

---

## 5. Investigación y Desarrollo (Entrenamientos)
Las mejoras globales se investigan en la *Escuela de Especialización*. Una vez investigadas, aplican a todas las propiedades del jugador.

*   **Planificación de Rutas:** Aumenta la velocidad de las flotas en el mapa.
*   **Planificación de Encargos:** Permite controlar más flotas simultáneamente.
*   **Administración de Base:** Mejora la eficiencia administrativa (requisito para edificios avanzados).
*   **Contrabando:** Mejora la capacidad de comercio y transporte oculto.
*   **Extorsión:** Habilidad básica para intimidar. Aumenta la fuerza de combate base.
*   **Combate Cuerpo a Cuerpo:** Mejora tropas básicas.
*   **Combate Armas Corta Distancia:** Mejora tropas intermedias.
*   **Entrenamiento de Tiro:** Vital para la precisión en combate avanzado.
*   **Fabricación de Explosivos:** Requisito para unidades de demolición.
*   **Espionaje:** Permite enviar sondas y obtener informes detallados de rivales.
*   **Seguridad (Tech):** Contramedida al espionaje enemigo (hace más difícil ser espiado).
*   **Entrenamiento Psicológico:** Mejora la moral y resistencia.
*   **Entrenamiento Químico:** Guerra sucia avanzada.
*   **Honor:** La cúspide de la jerarquía criminal. Otorga prestigio.

---

## 6. Mecánicas de Juego y Acciones

### Gestión del Tiempo (Colas)
El jugador debe administrar su tiempo eficientemente ya que las acciones no son instantáneas:
1.  **Cola de Construcción:** Solo se puede ampliar un edificio a la vez por propiedad.
2.  **Cola de Reclutamiento:** Las tropas se entrenan secuencialmente.
3.  **Cola de Investigación:** Solo una tecnología puede ser estudiada a la vez por jugador.

### Sistema de Misiones (El Mapa)
El mundo es una cuadrícula de coordenadas (Ciudad:Barrio:Edificio). Los jugadores interactúan enviando flotas.
*   **Atacar:** Misión ofensiva. Si la flota atacante vence a la defensa, llena su capacidad de carga con los recursos del defensor (Armas, Munición, Dólares).
*   **Transportar:** Envío pacífico de recursos a otra propiedad (propia o aliada).
*   **Espiar:** Misión de inteligencia. Requiere tecnología de Espionaje. El éxito depende de la diferencia de niveles de espionaje entre atacante y defensor.
*   **Colonizar:** Envío de un Consigliere y recursos para establecer una nueva propiedad en un espacio vacío.
*   **Recolectar:** Misión PvE para obtener recursos de zonas neutrales.

### Combate
El combate se resuelve automáticamente cuando una flota llega a su destino.
1.  **Cálculo:** Se comparan los valores totales de Ataque (Agresor) vs Defensa (Defensor + Bonus de Muro/Seguridad).
2.  **Resultado:** Se determinan las pérdidas de unidades de ambos bandos.
3.  **Botín:** El ganador (si es atacante) carga recursos hasta su capacidad máxima disponible.

---

## 7. Aspectos Sociales
*   **Familias (Alianzas):** Los jugadores se agrupan para protección mutua y ataques coordinados.
*   **Rangos:** Líder, Capitán, Miembro.
*   **Comunicación:** Sistema de mensajería privada y anuncios de familia.
