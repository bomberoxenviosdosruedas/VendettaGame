-- Migration to create the complete Spanish schema for Vendetta Games
-- Based on the legacy PHP/MySQL dump and modernized for Supabase/PostgreSQL.
-- Includes: Tables, RLS Policies, Config Data, and Core RPCs.

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Tablas de Configuración (Datos Estáticos)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.configuracion_edificios (
    id text PRIMARY KEY, -- ej: 'oficina', 'escuela'
    nombre text NOT NULL,
    descripcion text,
    costo_armas integer NOT NULL DEFAULT 0,
    costo_municion integer NOT NULL DEFAULT 0,
    costo_dolares integer NOT NULL DEFAULT 0,
    duracion_base integer NOT NULL DEFAULT 0, -- en segundos
    produccion_base integer NOT NULL DEFAULT 0,
    puntos numeric(10, 2) NOT NULL DEFAULT 0,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.configuracion_investigaciones (
    id text PRIMARY KEY, -- ej: 'rutas', 'armas'
    nombre text NOT NULL,
    descripcion text,
    costo_armas integer NOT NULL DEFAULT 0,
    costo_municion integer NOT NULL DEFAULT 0,
    costo_dolares integer NOT NULL DEFAULT 0,
    duracion_base integer NOT NULL DEFAULT 0,
    puntos numeric(10, 2) NOT NULL DEFAULT 0,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.configuracion_tropas (
    id text PRIMARY KEY, -- ej: 'maton', 'portero'
    nombre text NOT NULL,
    descripcion text,
    costo_armas integer NOT NULL DEFAULT 0,
    costo_municion integer NOT NULL DEFAULT 0,
    costo_dolares integer NOT NULL DEFAULT 0,
    duracion_base integer NOT NULL DEFAULT 0,
    puntos numeric(10, 2) NOT NULL DEFAULT 0,
    ataque integer NOT NULL DEFAULT 0,
    defensa integer NOT NULL DEFAULT 0,
    capacidad integer NOT NULL DEFAULT 0,
    velocidad integer NOT NULL DEFAULT 0,
    salario integer NOT NULL DEFAULT 0,
    tipo text CHECK (tipo IN ('ataque', 'defensa', 'especial')) DEFAULT 'ataque',
    creado_en timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. Usuarios y Perfiles (Mapeo de mob_usuarios)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.perfiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_usuario text UNIQUE NOT NULL,
    email text,
    legacy_id integer,
    ultimo_activo timestamptz,
    puntos_edificios numeric(15, 2) DEFAULT 0,
    puntos_tropas numeric(15, 2) DEFAULT 0,
    puntos_investigaciones numeric(15, 2) DEFAULT 0,
    puntos_total numeric(15, 2) DEFAULT 0,
    posicion_ranking integer,
    esta_baneado boolean DEFAULT false,
    fin_baneo timestamptz,
    idioma varchar(2) DEFAULT 'es',
    vacaciones boolean DEFAULT false,
    creado_en timestamptz DEFAULT now(),
    actualizado_en timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 3. Mundo de Juego: Alianzas y Guerras
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.alianzas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id integer,
    nombre text NOT NULL,
    etiqueta varchar(8) NOT NULL,
    descripcion text,
    logo_url text,
    sitio_web text,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.miembros_alianza (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alianza_id uuid REFERENCES public.alianzas(id) ON DELETE CASCADE,
    perfil_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    rango text,
    unido_en timestamptz DEFAULT now(),
    UNIQUE(perfil_id)
);

CREATE TABLE IF NOT EXISTS public.solicitudes_alianza (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    alianza_id uuid REFERENCES public.alianzas(id) ON DELETE CASCADE,
    mensaje text,
    fecha timestamptz DEFAULT now(),
    UNIQUE(perfil_id, alianza_id)
);

CREATE TABLE IF NOT EXISTS public.guerras (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alianza1_id uuid REFERENCES public.alianzas(id),
    alianza2_id uuid REFERENCES public.alianzas(id),
    fecha_inicio timestamptz DEFAULT now(),
    fecha_fin timestamptz,
    declaracion text,
    ganador_id uuid REFERENCES public.alianzas(id),
    puntos_perdidos_alianza1 numeric(15, 2) DEFAULT 0,
    puntos_perdidos_alianza2 numeric(15, 2) DEFAULT 0,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rendiciones_guerra (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guerra_id uuid REFERENCES public.guerras(id) ON DELETE CASCADE,
    alianza_id uuid REFERENCES public.alianzas(id), -- Quien se rinde
    mensaje text,
    fecha timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. Propiedades y Contenido (Base, Edificios, Tropas)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.propiedades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id integer,
    perfil_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    nombre text,
    coord_x integer NOT NULL,
    coord_y integer NOT NULL,
    coord_z integer NOT NULL,
    recursos_armas numeric(20, 2) DEFAULT 0,
    recursos_municion numeric(20, 2) DEFAULT 0,
    recursos_alcohol numeric(20, 2) DEFAULT 0,
    recursos_dolares numeric(20, 2) DEFAULT 0,
    puntos numeric(15, 2) DEFAULT 0,
    ultima_actualizacion timestamptz DEFAULT now(),
    creado_en timestamptz DEFAULT now(),
    UNIQUE(coord_x, coord_y, coord_z)
);

CREATE TABLE IF NOT EXISTS public.edificios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE CASCADE,
    edificio_id text REFERENCES public.configuracion_edificios(id),
    nivel integer NOT NULL DEFAULT 0,
    creado_en timestamptz DEFAULT now(),
    UNIQUE(propiedad_id, edificio_id)
);

CREATE TABLE IF NOT EXISTS public.tropas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE CASCADE,
    tropa_id text REFERENCES public.configuracion_tropas(id),
    cantidad integer NOT NULL DEFAULT 0,
    creado_en timestamptz DEFAULT now(),
    UNIQUE(propiedad_id, tropa_id)
);

CREATE TABLE IF NOT EXISTS public.investigaciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    investigacion_id text REFERENCES public.configuracion_investigaciones(id),
    nivel integer NOT NULL DEFAULT 0,
    creado_en timestamptz DEFAULT now(),
    UNIQUE(perfil_id, investigacion_id)
);

-- -----------------------------------------------------------------------------
-- 5. Colas de Procesos
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.cola_construccion (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE CASCADE,
    edificio_id text REFERENCES public.configuracion_edificios(id),
    nivel_destino integer NOT NULL,
    inicio timestamptz DEFAULT now(),
    fin timestamptz NOT NULL,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cola_reclutamiento (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE CASCADE,
    tropa_id text REFERENCES public.configuracion_tropas(id),
    cantidad integer NOT NULL,
    inicio timestamptz DEFAULT now(),
    fin timestamptz NOT NULL,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cola_investigacion (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    propiedad_id uuid REFERENCES public.propiedades(id) ON DELETE SET NULL,
    investigacion_id text REFERENCES public.configuracion_investigaciones(id),
    nivel_destino integer NOT NULL,
    inicio timestamptz DEFAULT now(),
    fin timestamptz NOT NULL,
    creado_en timestamptz DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 6. Interacciones, Mercado, Pagos
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ofertas_mercado (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    recurso text NOT NULL,
    cantidad integer NOT NULL,
    pide_armas integer DEFAULT 0,
    pide_municion integer DEFAULT 0,
    pide_dolares integer DEFAULT 0,
    comprador_id uuid REFERENCES public.perfiles(id),
    aceptada boolean DEFAULT false,
    creado_en timestamptz DEFAULT now(),
    expira_en timestamptz
);

CREATE TABLE IF NOT EXISTS public.mensajes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    remitente_id uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
    destinatario_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    asunto text,
    cuerpo text,
    leido boolean DEFAULT false,
    borrado_remitente boolean DEFAULT false,
    borrado_destinatario boolean DEFAULT false,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    remitente_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    destinatario_id uuid REFERENCES public.perfiles(id) ON DELETE SET NULL,
    mensaje text NOT NULL,
    enviado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movimientos_mapa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id uuid REFERENCES public.perfiles(id) ON DELETE CASCADE,
    propiedad_origen_id uuid REFERENCES public.propiedades(id) ON DELETE CASCADE,
    destino_x integer NOT NULL,
    destino_y integer NOT NULL,
    destino_z integer NOT NULL,
    tipo_mision text NOT NULL,
    tropas jsonb NOT NULL DEFAULT '{}'::jsonb,
    recursos jsonb DEFAULT '{}'::jsonb,
    salida timestamptz DEFAULT now(),
    llegada timestamptz NOT NULL,
    regreso timestamptz,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.batallas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id integer,
    atacante_id uuid REFERENCES public.perfiles(id),
    defensor_id uuid REFERENCES public.perfiles(id),
    resultado text,
    puntos_ganados_atacante integer,
    puntos_ganados_defensor integer,
    recursos_robados jsonb,
    detalle_log jsonb,
    fecha timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.baneos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id uuid REFERENCES public.perfiles(id) NOT NULL,
    admin_id uuid REFERENCES public.perfiles(id),
    motivo text,
    inicio timestamptz DEFAULT now(),
    fin timestamptz NOT NULL,
    creado_en timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.premium_transacciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id uuid REFERENCES public.perfiles(id),
    transaccion_id text NOT NULL,
    producto_id integer,
    codigo text,
    fecha timestamptz DEFAULT now(),
    UNIQUE(transaccion_id)
);

-- -----------------------------------------------------------------------------
-- 7. Funciones Core (RPCs)
-- -----------------------------------------------------------------------------

-- 7.1 Manejador de Nuevos Usuarios
CREATE OR REPLACE FUNCTION public.manejador_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre_usuario, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario ' || substr(new.id::text, 1, 8)),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para nuevo usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.manejador_nuevo_usuario();

-- 7.2 Inicializar Propiedad del Jugador
CREATE OR REPLACE FUNCTION public.inicializar_propiedad(
  p_nombre_propiedad text DEFAULT 'Base Principal'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_perfil_id uuid;
  v_propiedad_id uuid;
  v_x integer;
  v_y integer;
  v_z integer;
  v_intentos integer := 0;
  v_encontrado boolean := false;
BEGIN
  v_perfil_id := auth.uid();
  
  -- Verificar si ya tiene propiedad
  IF EXISTS (SELECT 1 FROM public.propiedades WHERE perfil_id = v_perfil_id) THEN
    RETURN json_build_object('error', 'El usuario ya tiene una propiedad inicial.');
  END IF;

  -- Buscar coordenada libre (intento simple)
  LOOP
    v_x := floor(random() * 50 + 1)::int;
    v_y := floor(random() * 50 + 1)::int;
    v_z := floor(random() * 100 + 1)::int;
    
    IF NOT EXISTS (SELECT 1 FROM public.propiedades WHERE coord_x = v_x AND coord_y = v_y AND coord_z = v_z) THEN
      v_encontrado := true;
      EXIT;
    END IF;
    
    v_intentos := v_intentos + 1;
    IF v_intentos > 100 THEN
      RAISE EXCEPTION 'No se pudo encontrar una coordenada libre.';
    END IF;
  END LOOP;

  -- Crear propiedad
  INSERT INTO public.propiedades (perfil_id, nombre, coord_x, coord_y, coord_z, recursos_armas, recursos_municion, recursos_dolares)
  VALUES (v_perfil_id, p_nombre_propiedad, v_x, v_y, v_z, 1000, 1000, 1000)
  RETURNING id INTO v_propiedad_id;

  -- Crear edificio inicial (Oficina nivel 1)
  INSERT INTO public.edificios (propiedad_id, edificio_id, nivel)
  VALUES (v_propiedad_id, 'oficina', 1);

  RETURN json_build_object('id', v_propiedad_id, 'coord_x', v_x, 'coord_y', v_y, 'mensaje', 'Propiedad inicializada correctamente.');
END;
$$;

-- -----------------------------------------------------------------------------
-- 8. Inserción de Datos de Configuración
-- -----------------------------------------------------------------------------

INSERT INTO public.configuracion_investigaciones (id, nombre, costo_armas, costo_municion, costo_dolares, duracion_base, puntos) VALUES
('rutas', 'Planificacion de rutas', 500, 1200, 0, 2000, 15.5),
('encargos', 'Planificacion de encargos', 1000, 2500, 1000, 5000, 46),
('extorsion', 'Extorsion', 1000, 2000, 0, 3000, 26),
('administracion', 'Administración de base', 0, 0, 5000, 14400, 76),
('contrabando', 'Contrabando', 0, 0, 1500, 9600, 23.5),
('espionaje', 'Espionaje', 500, 500, 300, 4200, 13),
('seguridad', 'Seguridad', 1000, 4000, 1000, 4000, 61),
('proteccion', 'Proteccion de grupo', 3000, 5000, 2000, 5000, 96),
('combate', 'Combate cuerpo a cuerpo', 2000, 2000, 3000, 6200, 76),
('armas', 'Combate de armas a corta distancia', 1000, 200, 3000, 5100, 53),
('tiro', 'Entrenamiento de Tiro', 5000, 12000, 10000, 19200, 296),
('explosivos', 'Fabricación de explosivos', 10000, 19500, 15000, 42000, 471),
('guerrilla', 'Entrenamiento de guerrilla', 8000, 10000, 12000, 20000, 321),
('psicologico', 'Entrenamiento psicologico', 2000, 5000, 16000, 26000, 301),
('quimico', 'Entrenamiento químico', 4000, 12000, 1000, 14400, 0),
('honor', 'Honor', 0, 0, 280000, 92000, 4201)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.configuracion_edificios (id, nombre, descripcion, costo_armas, costo_municion, costo_dolares, duracion_base, produccion_base, puntos) VALUES
('oficina', 'Oficina del Jefe', 'El Jefe se encuentra en esta oficina, y aquí, se toman todas las decisiones. Coordina el desarrollo y la velocidad de construcción de las otras áreas. Cuando más nivel, más rápido se desarrollan el resto.', 100, 200, 0, 900, 0, 6),
('escuela', 'Escuela de especialización', 'Como ya dice el nombre, esta habitación permite el entrenamiento de "los chicos" en nuevas ténicas, permitiéndoles tener más experiencia en combate. Al igual que para la oficina de El Jefe, cuánto más rápido se haga el entrenamiento, más rápido se desarrollan las habilidades.', 1000, 1000, 0, 2000, 0, 31.75),
('armeria', 'Armería', 'Aquí, en la Armería, como dice el nombre, se guardan armas. Serán de gran necesidad para ocupar nuevos lugares, y para entrenamientos en combate. Cuanto mejor desarrollada esté, más armas podrás hacer al mismo tiempo.', 12, 60, 0, 500, 10, 2.32),
('municion', 'Almacén de munición', 'El almacén de munición es similar a la armería. Aquí, se manufactura la munición importante. Es necesaria, en grandes cantidades, al ocupar áreas, así como para su uso en entrenamientos. A diferencia de las armas, la munición se usa mucho más rápido.', 9, 15, 0, 600, 10, 1.39),
('cerveceria', 'Cervecería', 'Esta habitación manufactura alcohol. Desgraciadamente (¿o afortunadamente?) está prohibido y por tanto, muy demandado por la población, así que es un negocio próspero. Sin embargo, necesitarás ciertas estrategias para poder llevarlo hasta los ciudadanos.', 20, 20, 0, 1000, 50, 1.6),
('taberna', 'Taberna', 'En la taberna se consume alcohol. Aquí es donde traficas con Alcohol. Ten cuidado de no ser detectado por la Policia, o te saldrá caro. Dado que la taberna se supervisa batante mal, la conversión de alcohol es moderada.', 10, 50, 0, 1500, 8, 2.1),
('contrabando', 'Contrabando', 'Mejor que la taberna funciona el contrabando, podrás vender alcohol con un impacto mucho mayor, lo que naturalmente, beneficia a la caja de los gángsters. Desgraciadamente, esta táctica es arriesgada, y mucho más costosa.', 2000, 5000, 500, 4000, 21, 136),
('almacen_armas', 'Almacén de armas', 'En el almacén de armas, se guarda todo el armamento que no se necesita de inmediato. El proceso es automático, y se mantienen allí hasta que sean necesarias. Además, ningún enemigo podrá robártelas de este almacén.', 100, 500, 0, 9000, 0, 12),
('deposito', 'Depósito de munición', 'El depósito de munición funciona de forma similar al almacén de armas. Se guardan cajas de munición y granadas que no se vayan a usar de inmediato. Además, aquí están más seguras, a salvo del enemigo.', 500, 600, 0, 12000, 0, 18),
('almacen_alcohol', 'Almacén de alcohol', 'Ya que la destilación de alcohol es bastante sencilla, la producción es alta. Para poder almacenarlo sin perder el exceso de producción, necesitas construir un almacén de alcohol. En el mismo, estará a salvo de los enemigos.', 200, 200, 0, 8000, 0, 7),
('caja', 'Caja fuerte', 'Después de realizar un contrabando con éxito, conseguirás una buena cantidad de dólares. Pero, ¡presta atención!. Si no quieres tirar el dinero, debes usar esta caja, para prevenir que desaparezca, y para asegurarte liquidez.', 2000, 2000, 1000, 16000, 0, 91),
('campo', 'Campo de entrenamiento', 'Tal y como dice el nombre, en el campo de entrenamiento, tus "chicos" entrenarán. El mismo, dependerá según el tipo de unidades que puedas producir, por ejemplo, simples delincuentes, asesinos, profesionales, a los que tus enemigos tendrán un respeto extremo. Dependiendo del nivel, las unidades serán creadas en menor tiempo.', 1000, 2500, 0, 5600, 0, 61),
('seguridad', 'Seguridad', 'Al igual que el entrenamiento de luchadores en el campo de entrenamiento, aquí podrás entrenar a los más jóvenes en defensa. En principio, se quedarán permanentemente, siempre en el hogar, y protegiendo sus habitaciones contra enemigos. Si tus gángsters están de vuelta, automáticamente luchan juntos.', 0, 0, 0, 6000, 0, 45),
('torreta', 'Torreta de fuego automático', 'A fin de aliviar un poco el trabajo de los defensores, dispones de ciertas construcciones, como esta torreta de fuego automático. Técnicamente, son muy avanzadas, y en el momento en que detecten a un enemigo, abrirán fuego de golpe.', 1000, 2000, 200, 4500, 0, 57),
('minas', 'Minas ocultas', 'Estas minas son una ayuda incluso más "agradable". Tus chicos las repartirán a lo largo de la casa. Cuando algún enemigo la pise sin darse cuenta... ¡Buenas noches!', 2000, 2000, 150, 3000, 0, 65.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.configuracion_tropas (id, nombre, costo_armas, costo_municion, costo_dolares, duracion_base, puntos, ataque, defensa, capacidad, velocidad, salario, tipo) VALUES
('maton', 'Maton', 200, 1000, 0, 1400, 6, 5, 5, 200, 1600, 1, 'ataque'),
('portero', 'Portero', 500, 8000, 0, 1600, 6, 8, 6, 400, 2000, 1, 'defensa'),
('acuchillador', 'Acuchillador', 1000, 200, 0, 2000, 4, 10, 4, 300, 2500, 1, 'ataque'),
('pistolero', 'Pistolero', 2000, 3000, 0, 1200, 21, 30, 10, 500, 2400, 2, 'ataque'),
('ocupacion', 'Tropa de Ocupacion', 20000, 10000, 20000, 344000, 251, 1, 10, 3000, 2000, 500, 'especial'),
('espia', 'Espia', 500, 200, 0, 14000, 3, 1, 1, 50, 400000, 1, 'especial'),
('porteador', 'Porteador', 300, 100, 1000, 3600, 9, 4, 6, 10000, 2400, 5, 'especial'),
('cia', 'Agente de la CIA', 7000, 10000, 2500, 17000, 87, 100, 90, 3000, 3400, 30, 'ataque'),
('fbi', 'Agente del FBI', 4000, 6000, 1000, 15500, 48, 60, 50, 2000, 3000, 20, 'ataque'),
('transportista', 'Transportista', 1000, 2000, 5000, 17200, 51, 6, 8, 40000, 5000, 10, 'especial'),
('francotirador', 'Francotirador', 4000, 500, 2000, 25000, 28, 200, 10, 1000, 6000, 20, 'ataque'),
('asesino', 'Asesino', 10000, 15000, 10000, 6000, 176, 300, 200, 2000, 6500, 50, 'ataque'),
('ninja', 'Ninja', 2000, 1000, 30000, 40000, 236, 400, 600, 5000, 8000, 60, 'ataque'),
('mercenario', 'Mercenario', 80000, 120000, 50000, 144000, 1176, 1000, 1200, 12000, 4500, 300, 'ataque'),
('centinela', 'Centinela', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defensa'),
('policia', 'Policia', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defensa'),
('guardaespaldas', 'Guardaespaldas', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defensa'),
('guardia', 'Guardia', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defensa')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 9. Row Level Security (RLS)
-- -----------------------------------------------------------------------------

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edificios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tropas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cola_construccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cola_reclutamiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cola_investigacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ofertas_mercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_mapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alianzas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_alianza ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_alianza ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guerras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendiciones_guerra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_edificios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_investigaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_tropas ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Configuración)
CREATE POLICY "Lectura pública config edificios" ON public.configuracion_edificios FOR SELECT USING (true);
CREATE POLICY "Lectura pública config investigaciones" ON public.configuracion_investigaciones FOR SELECT USING (true);
CREATE POLICY "Lectura pública config tropas" ON public.configuracion_tropas FOR SELECT USING (true);

-- Perfiles
CREATE POLICY "Lectura pública perfiles" ON public.perfiles FOR SELECT USING (true);
CREATE POLICY "Actualizar propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);

-- Propiedades
CREATE POLICY "Lectura pública propiedades" ON public.propiedades FOR SELECT USING (true);
CREATE POLICY "Actualizar propia propiedad" ON public.propiedades FOR UPDATE USING (auth.uid() = perfil_id);

-- Datos Privados
CREATE POLICY "Ver propios edificios" ON public.edificios FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.propiedades WHERE propiedades.id = edificios.propiedad_id AND propiedades.perfil_id = auth.uid())
);
CREATE POLICY "Ver propias tropas" ON public.tropas FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.propiedades WHERE propiedades.id = tropas.propiedad_id AND propiedades.perfil_id = auth.uid())
);
CREATE POLICY "Ver propias investigaciones" ON public.investigaciones FOR SELECT USING (auth.uid() = perfil_id);

-- Colas
CREATE POLICY "Ver propia cola construcción" ON public.cola_construccion FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.propiedades WHERE propiedades.id = cola_construccion.propiedad_id AND propiedades.perfil_id = auth.uid())
);
CREATE POLICY "Ver propia cola reclutamiento" ON public.cola_reclutamiento FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.propiedades WHERE propiedades.id = cola_reclutamiento.propiedad_id AND propiedades.perfil_id = auth.uid())
);
CREATE POLICY "Ver propia cola investigación" ON public.cola_investigacion FOR SELECT USING (auth.uid() = perfil_id);

-- Mensajes y Chat
CREATE POLICY "Ver propios mensajes" ON public.mensajes FOR SELECT USING (auth.uid() = remitente_id OR auth.uid() = destinatario_id);
CREATE POLICY "Ver chat global" ON public.chat FOR SELECT USING (destinatario_id IS NULL OR destinatario_id = auth.uid() OR remitente_id = auth.uid());
CREATE POLICY "Enviar mensajes chat" ON public.chat FOR INSERT WITH CHECK (auth.uid() = remitente_id);

-- Alianzas y Guerras
CREATE POLICY "Lectura pública alianzas" ON public.alianzas FOR SELECT USING (true);
CREATE POLICY "Lectura miembros alianza" ON public.miembros_alianza FOR SELECT USING (true);
CREATE POLICY "Lectura guerras" ON public.guerras FOR SELECT USING (true);
CREATE POLICY "Lectura rendiciones" ON public.rendiciones_guerra FOR SELECT USING (true);
CREATE POLICY "Ver propias solicitudes" ON public.solicitudes_alianza FOR SELECT USING (auth.uid() = perfil_id);

-- Movimientos y Batallas
CREATE POLICY "Ver propios movimientos" ON public.movimientos_mapa FOR SELECT USING (auth.uid() = perfil_id);
CREATE POLICY "Ver propias batallas" ON public.batallas FOR SELECT USING (auth.uid() = atacante_id OR auth.uid() = defensor_id);

-- Premium
CREATE POLICY "Ver propias transacciones" ON public.premium_transacciones FOR SELECT USING (auth.uid() = perfil_id);

COMMIT;
