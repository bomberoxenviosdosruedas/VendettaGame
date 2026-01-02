# Informe Funcional Integral: Legacy Project (Vendetta Clone)

## 1. Resumen Arquitectónico

El sistema analizado es un juego de estrategia en tiempo real basado en navegador (MMORTS), implementado sobre **Zend Framework 1** (PHP) con base de datos **MySQL**. La arquitectura sigue el patrón **MVC (Modelo-Vista-Controlador)**.

*   **Core Lógico:** La lógica de negocio reside principalmente en `application/models/` y `library/Mob/`. Se utiliza un sistema de carga de clases (`Mob_Loader`) para instanciar modelos específicos (ej: `Mob_Habitacion_Vendetta_Oficina`).
*   **Persistencia:** Se utiliza `Zend_Db_Table` para la interacción con la base de datos. El esquema sugiere una estructura relacional clásica con tablas para usuarios, edificios, tropas, misiones y reportes de batalla.
*   **Motor de Juego:**
    *   **Sistema de Construcción:** Colas de construcción gestionadas por `Mob_Model_Construccion`.
    *   **Sistema de Combate:** Motor de simulación por rondas (`Mob_Combat_Mercenarios`), calculado al finalizar una misión de ataque.
    *   **Mapa:** Sistema de coordenadas 3D (Ciudad:Barrio:Edificio).

---

## 2. Diccionario de Datos (Entidades Clave)

Basado en el esquema de base de datos (`vendetta_plus_old.sql`) y los modelos:

| Entidad | Tabla Principal | Descripción |
| :--- | :--- | :--- |
| **Usuario** | `mob_usuarios` | Datos de cuenta, puntos totales, coordenadas principales. |
| **Edificio (Base)** | `mob_edificios` | Representa una base/ciudad en el mapa. Almacena recursos (`arm`, `mun`, `alc`, `dol`) y coordenadas (`coord1`, `coord2`, `coord3`). |
| **Habitaciones** | `mob_habitaciones` | Niveles de las estructuras dentro de una base (Oficina, Escuela, Armería, etc.). |
| **Tropas** | `mob_tropas` | Cantidad de unidades militares estacionadas en una base. |
| **Entrenamientos** | `mob_entrenamientos` | Niveles de investigación/tecnología del usuario (globales o por base). |
| **Misiones** | `mob_misiones` | Movimientos de flotas en curso (Ataque, Transporte, Ocupación, etc.). |
| **Batallas** | `mob_batallas` | Histórico de reportes de combate. |
| **Mercado** | `mob_mercado` | Ofertas de comercio entre usuarios. |

---

## 3. Manual de Mecánicas

### A. Estructura del Juego (Site Map)

El juego se divide en módulos accesibles desde la interfaz principal:

*   **Visión General:** Estado general de la base.
*   **Edificios (Infraestructura):** Gestión de construcción de habitaciones.
*   **Recursos:** Vista de producción.
*   **Investigación (Entrenamientos):** Árbol tecnológico.
*   **Tropas (Reclutamiento):** Entrenamiento de unidades.
*   **Base (Seguridad):** Entrenamiento de unidades defensivas.
*   **Flota/Misiones:** Envío de tropas a otras coordenadas.
*   **Mapa:** Exploración del universo (Celdas `X:Y:Z`).
*   **Mensajes/Alianzas:** Comunicación y gestión social.

### B. Economía y Recursos

Existen 4 recursos principales:
1.  **Armas (`arm`)**
2.  **Munición (`mun`)**
3.  **Dólares (`dol`)**
4.  **Alcohol (`alc`)**

#### Fórmulas de Producción
La producción base y por nivel depende del tipo de edificio.

*   **Fórmula General de Producción:**
    $$Producción = Base + \text{round}\left(Factor \times \left(\frac{Nivel + Offset}{Divisor}\right)^{Exponente}\right)$$

    *Donde los parámetros dependen del edificio (ver Tabla de Infraestructura).*

*   **Consumo de Alcohol:**
    Ciertos edificios (Taberna, Contrabando) generan Dólares pero consumen Alcohol.
    *   **Taberna:** $Consumo = (Produccion \times 7) + 3$
    *   **Contrabando:** $Consumo = (Produccion \times 4) + 1$

### C. Infraestructura (Habitaciones)

Las habitaciones definen la capacidad de la base.

*   **Fórmula de Costo de Construcción:**
    $$Costo_{recurso} = CostoBase_{recurso} \times (Nivel + 1)^2$$
    *(Nota: El costo aumenta cuadráticamente con el nivel).*

*   **Fórmula de Tiempo de Construcción:**
    $$Tiempo (segundos) = \text{round}\left( \frac{(Nivel+1)^2 \times DuracionBase}{NivelOficina \times 3} \right)$$
    *(Nota: `NivelOficina` reduce el tiempo. El factor 3 es un acelerador global hardcodeado).*

*   **Tabla de Edificios (Valores Base):**

| Edificio | Arm | Mun | Dol | Tiempo Base (s) | Prod/Efecto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Oficina** | 100 | 200 | 0 | 900 | Reduce tiempos de construcción. |
| **Escuela** | 1000 | 1000 | 0 | 2000 | Reduce tiempos de entrenamiento. |
| **Armería** | 12 | 60 | 0 | 500 | Prod. Armas. |
| **Almacén Munición** | 9 | 15 | 0 | 600 | Prod. Munición. |
| **Cervecería** | 20 | 20 | 0 | 1000 | Prod. Alcohol. |
| **Taberna** | 10 | 50 | 0 | 1500 | Convierte Alcohol en Dinero (Baja eficiencia). |
| **Contrabando** | 2000 | 5000 | 500 | 4000 | Convierte Alcohol en Dinero (Alta eficiencia). |
| **Almacenes** | Varios | Varios | 0 | Varios | Aumentan capacidad segura de recursos (`Capacidad = Nivel * 150000 + 10000`). |

*(Valores extraídos de `gameconfig.php`)*

### D. Militar (Entrenamiento y Tropas)

*   **Estadísticas de Unidades:** Cada unidad tiene Ataque, Defensa, Capacidad de Carga, Velocidad y Costo.
*   **Entrenamiento:** Requiere recursos y tiempo.
    *   **Tiempo de Entrenamiento:** Afectado por el nivel de la "Escuela".

*   **Tabla de Unidades (Ejemplo Selecto):**

| Unidad | Ataque | Defensa | Capacidad | Velocidad | Req. |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Matón** | 5 | 5 | 200 | 1600 | - |
| **Portero** | 8 | 6 | 400 | 2000 | - |
| **Pistolero** | 30 | 10 | 500 | 2400 | - |
| **Espía** | 1 | 1 | 50 | 400000 | Espionaje |
| **Mercenario** | 1000 | 1200 | 12000 | 4500 | Varios |

### E. Misiones y Mapa

Las unidades pueden enviarse a otras coordenadas.

*   **Coordenadas:** Formato `Ciudad:Barrio:Edificio` (ej: `1:1:1`).
*   **Tipos de Misión:**
    1.  **Atacar:** Combate contra el defensor.
    2.  **Transportar:** Mover recursos entre bases.
    3.  **Estacionar:** Mover tropas permanentemente a otra base propia.
    4.  **Ocupar:** Conquistar un espacio vacío para fundar una nueva base.
    5.  **Regresar:** Retorno automático tras misión.

*   **Cálculo de Distancia:**
    $$Distancia = \sqrt{DistanciaArriba^2 + DistanciaIzquierda^2} \times 1000$$
    *Donde `DistanciaArriba` y `DistanciaIzquierda` se calculan considerando la topología del mapa (posiblemente toroidal o con saltos por bloques de 17/15).*

*   **Tiempo de Viaje:** Depende de la distancia y la unidad más lenta del escuadrón.

### F. Motor de Combate (Batallas)

El combate se resuelve en el servidor (`Mob_Combat_Mercenarios`).

1.  **Duración:** Máximo 5 rondas.
2.  **Cálculo de Poder (Por Bando):**
    *   **PAA (Poder de Ataque Atacante):** Suma del ataque de todas las unidades atacantes.
    *   **PDA (Poder de Defensa Atacante):** Suma de la defensa de las unidades atacantes.
    *   **PAD (Poder de Ataque Defensor):** Suma del ataque de las unidades defensoras.
    *   **PDD (Poder de Defensa Defensor):** Suma de la defensa de las unidades defensoras.
    *   *Nota: Se aplican bonificadores porcentuales (`pctPoderA`, `pctPoderD`) basados en entrenamientos/honor.*

3.  **Resolución de Ronda:**
    *   Se calcula el porcentaje de pérdidas para cada bando (`PPA` y `PPD`) usando una fórmula lineal basada en la proporción de fuerzas.
    *   **Fórmula de Pérdidas (Aproximada):**
        Si la fuerza total de un bando supera 10 veces al otro, el débil pierde el 100% (`1`) y el fuerte el 0%.
        En caso contrario:
        $$PPA_{base} = \frac{PAD + PPD}{(PAD + PPD) + (PAA + PDA) \times 2}$$
        *(Se ajusta luego ligeramente a favor del bando con más unidades).*
    *   Las unidades se eliminan proporcionalmente al porcentaje de pérdidas calculado.

4.  **Robo de Recursos (Saqueo):**
    *   Si el atacante gana (o sobreviven tropas), puede robar recursos.
    *   **Capacidad de Robo:** Suma de `Capacidad` de las unidades supervivientes.
    *   **Recursos Disponibles:** Total en base menos la capacidad segura de los almacenes ("Búnker").
    *   El robo se distribuye proporcionalmente entre los recursos disponibles hasta llenar la capacidad de carga.

### G. Gestión de Usuarios

*   **Registro:** El código analizado (`Register_IndexController`) muestra un script de inicio acelerado ("Speed Server") que otorga **20 bases** iniciales con edificios y recursos aleatorios de alto nivel. Esto es atípico y sugiere un entorno de pruebas o una configuración "Fast".
*   **Ranking:** Basado en puntos.
    *   **Puntos de Edificios:** Suma de puntos definidos por nivel de edificio.
    *   **Puntos de Tropas:** Suma del valor de las unidades.
    *   **Puntos de Entrenamiento:** Valor de las investigaciones.

---
