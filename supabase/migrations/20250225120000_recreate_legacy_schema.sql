-- Migration script to recreate the legacy schema and populate configuration data
-- Generated based on legacy MySQL dump and PHP configuration arrays.

BEGIN;

-- -----------------------------------------------------------------------------
-- Part 1: Schema Definition (DDL)
-- Maps legacy `mob_*` tables to modern PostgreSQL schema with snake_case and proper types.
-- -----------------------------------------------------------------------------

-- Create a schema for the game if desired, but using public for simplicity as per standard Supabase setup.

-- 1. Configuration Tables (Static Data from PHP Arrays)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.config_buildings (
    id text PRIMARY KEY, -- e.g., 'oficina', 'escuela'
    name text NOT NULL,
    description text,
    cost_armaments integer NOT NULL DEFAULT 0,
    cost_munitions integer NOT NULL DEFAULT 0,
    cost_dollars integer NOT NULL DEFAULT 0,
    base_duration integer NOT NULL DEFAULT 0, -- in seconds
    base_production integer NOT NULL DEFAULT 0,
    points numeric(10, 2) NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.config_research (
    id text PRIMARY KEY, -- e.g., 'rutas', 'armas'
    name text NOT NULL,
    description text,
    cost_armaments integer NOT NULL DEFAULT 0,
    cost_munitions integer NOT NULL DEFAULT 0,
    cost_dollars integer NOT NULL DEFAULT 0,
    base_duration integer NOT NULL DEFAULT 0, -- in seconds
    points numeric(10, 2) NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.config_units (
    id text PRIMARY KEY, -- e.g., 'maton', 'portero'
    name text NOT NULL,
    description text,
    cost_armaments integer NOT NULL DEFAULT 0,
    cost_munitions integer NOT NULL DEFAULT 0,
    cost_dollars integer NOT NULL DEFAULT 0,
    base_duration integer NOT NULL DEFAULT 0, -- in seconds
    points numeric(10, 2) NOT NULL DEFAULT 0,
    attack integer NOT NULL DEFAULT 0,
    defense integer NOT NULL DEFAULT 0,
    capacity integer NOT NULL DEFAULT 0,
    velocity integer NOT NULL DEFAULT 0,
    salary integer NOT NULL DEFAULT 0, -- upkeep cost
    type text CHECK (type IN ('attack', 'defense', 'special')) DEFAULT 'attack',
    created_at timestamptz DEFAULT now()
);

-- 2. User & Profile Tables
-- -----------------------------------------------------------------------------

-- `auth.users` is managed by Supabase. We create a public profile table linked to it.
-- Mapped from `mob_usuarios`.

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    email text, -- Optional, mostly handled by auth.users
    legacy_id integer, -- To keep reference to old ID during migration
    last_active_at timestamptz,
    points_buildings numeric(15, 2) DEFAULT 0,
    points_units numeric(15, 2) DEFAULT 0,
    points_research numeric(15, 2) DEFAULT 0,
    total_points numeric(15, 2) DEFAULT 0,
    ranking_position integer,
    is_banned boolean DEFAULT false,
    language varchar(2) DEFAULT 'es',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Game World Tables
-- -----------------------------------------------------------------------------

-- Mapped from `mob_familias`
CREATE TABLE IF NOT EXISTS public.alliances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id integer,
    name text NOT NULL,
    tag varchar(8) NOT NULL,
    description text,
    logo_url text,
    website text,
    created_at timestamptz DEFAULT now()
);

-- Mapped from `mob_familias_miembros`
CREATE TABLE IF NOT EXISTS public.alliance_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alliance_id uuid REFERENCES public.alliances(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    rank_name text, -- Simplified from rank ID
    joined_at timestamptz DEFAULT now(),
    UNIQUE(user_id) -- User can only be in one alliance
);

-- Mapped from `mob_edificios` (Bases)
CREATE TABLE IF NOT EXISTS public.bases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id integer,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text, -- Optional custom name
    coord_x integer NOT NULL,
    coord_y integer NOT NULL,
    coord_z integer NOT NULL,
    resources_armaments numeric(20, 2) DEFAULT 0,
    resources_munitions numeric(20, 2) DEFAULT 0,
    resources_alcohol numeric(20, 2) DEFAULT 0,
    resources_dollars numeric(20, 2) DEFAULT 0,
    points numeric(15, 2) DEFAULT 0,
    last_updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE(coord_x, coord_y, coord_z)
);

-- Mapped from `mob_habitaciones` (Building Levels in a Base)
-- Instead of wide table with column per building, we use a normalized EAV approach or a JSONB column.
-- Given the requirement for strict schema, let's use a normalized table.
CREATE TABLE IF NOT EXISTS public.base_buildings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_id uuid REFERENCES public.bases(id) ON DELETE CASCADE,
    building_id text REFERENCES public.config_buildings(id),
    level integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(base_id, building_id)
);

-- Mapped from `mob_tropas` (Units in a Base)
CREATE TABLE IF NOT EXISTS public.base_units (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_id uuid REFERENCES public.bases(id) ON DELETE CASCADE,
    unit_id text REFERENCES public.config_units(id),
    amount integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(base_id, unit_id)
);

-- Mapped from `mob_entrenamientos` (Research Levels per User)
CREATE TABLE IF NOT EXISTS public.user_research (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    research_id text REFERENCES public.config_research(id),
    level integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, research_id)
);

-- 4. Queue Tables (Construction, Training, Research)
-- -----------------------------------------------------------------------------

-- Mapped from `mob_habitaciones_nuevas`
CREATE TABLE IF NOT EXISTS public.construction_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_id uuid REFERENCES public.bases(id) ON DELETE CASCADE,
    building_id text REFERENCES public.config_buildings(id),
    target_level integer NOT NULL,
    start_time timestamptz DEFAULT now(),
    end_time timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Mapped from `mob_tropas_nuevas`
CREATE TABLE IF NOT EXISTS public.unit_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    base_id uuid REFERENCES public.bases(id) ON DELETE CASCADE,
    unit_id text REFERENCES public.config_units(id),
    amount integer NOT NULL,
    start_time timestamptz DEFAULT now(),
    end_time timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Mapped from `mob_entrenamientos_nuevos`
CREATE TABLE IF NOT EXISTS public.research_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    base_id uuid REFERENCES public.bases(id) ON DELETE SET NULL, -- Research happens at a base but belongs to user
    research_id text REFERENCES public.config_research(id),
    target_level integer NOT NULL,
    start_time timestamptz DEFAULT now(),
    end_time timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 5. Interaction Tables (Market, Messages, Map Movements)
-- -----------------------------------------------------------------------------

-- Mapped from `mob_mercado`
CREATE TABLE IF NOT EXISTS public.market_offers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_type text NOT NULL, -- 'arm', 'mun', 'dol', 'alc'
    amount integer NOT NULL,
    cost_armaments integer DEFAULT 0,
    cost_munitions integer DEFAULT 0,
    cost_dollars integer DEFAULT 0,
    recipient_id uuid REFERENCES public.profiles(id), -- Null for public offer
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz
);

-- Mapped from `mob_mensajes`
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject text,
    body text,
    is_read boolean DEFAULT false,
    is_deleted_by_sender boolean DEFAULT false,
    is_deleted_by_recipient boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Mapped from `mob_misiones`
CREATE TABLE IF NOT EXISTS public.map_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    origin_base_id uuid REFERENCES public.bases(id) ON DELETE CASCADE,
    target_coord_x integer,
    target_coord_y integer,
    target_coord_z integer,
    mission_type text NOT NULL, -- 'attack', 'transport', 'spy', etc.
    units jsonb NOT NULL DEFAULT '{}'::jsonb, -- { "maton": 10, ... }
    resources jsonb DEFAULT '{}'::jsonb, -- { "arm": 100, ... }
    start_time timestamptz DEFAULT now(),
    arrival_time timestamptz NOT NULL,
    return_time timestamptz,
    created_at timestamptz DEFAULT now()
);


-- -----------------------------------------------------------------------------
-- Part 2: Data Population (DML)
-- Inserts data from PHP arrays in gameconfig.php
-- -----------------------------------------------------------------------------

-- 2.1 Research (Entrenamientos)
INSERT INTO public.config_research (id, name, cost_armaments, cost_munitions, cost_dollars, base_duration, points) VALUES
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

-- 2.2 Buildings (Habitaciones)
INSERT INTO public.config_buildings (id, name, description, cost_armaments, cost_munitions, cost_dollars, base_duration, base_production, points) VALUES
('oficina', 'Oficina del Jefe', 'El Jefe se encuentra en esta oficina, y aquí, se toman todas las decisiones. Coordina el desarrollo y la velocidad de construcción de las otras áreas. Cuando más nivel, más rápido se desarrollan el resto.', 100, 200, 0, 900, 0, 6),
('escuela', 'Escuela de especialización', 'Como ya dice el nombre, esta habitación permite el entrenamiento de "los chicos" en nuevas ténicas, permitiéndoles tener más experiencia en combate. Al igual que para la oficina de El Jefe, cuánto más rápido se haga el entrenamiento, más rápido se desarrollan las habilidades.', 1000, 1000, 0, 2000, 0, 31.75),
('armeria', 'Armería', 'Aquí, en la Armería, como dice el nombre, se guardan armas. Serán de gran necesidad para ocupar nuevos lugares, y para entrenamientos en combate. Cuanto mejor desarrollada esté, más armas podrás hacer al mismo tiempo.', 12, 60, 0, 500, 10, 2.32),
('municion', 'Almacén de munición', 'El almacén de munición es similar a la armería. Aquí, se manufactura la munición importante. Es necesaria, en grandes cantidades, al ocupar áreas, así como para su uso en entrenamientos. A diferencia de las armas, la munición se usa mucho más rápido.', 9, 15, 0, 600, 10, 1.39),
('cerveceria', 'Cervecería', 'Esta habitación manufactura alcohol. Desgraciadamente (¿o afortunadamente?) está prohibido y por tanto, muy demandado por la población, así que es un negocio próspero. Sin embargo, necesitarás ciertas estrategias para poder llevarlo hasta los ciudadanos.', 20, 20, 0, 1000, 50, 1.6),
('taberna', 'Taberna', 'En la taberna se consume alcohol. Aquí es donde traficas con Alcohol. Ten cuidado de no ser detectado por la Policia, o te saldrá caro. Dado que la taberna se supervisa batante mal, la conversión de alcohol es moderada.', 10, 50, 0, 1500, 8, 2.1),
('contrabando', 'Contrabando', 'Mejor que la taberna funciona el contrabando, podrás vender alcohol con un impacto mucho mayor, lo que naturalmente, beneficia a la caja de los gángsters. Desgraciadamente, esta táctica es arriesgada, y mucho más costosa.', 2000, 5000, 500, 4000, 21, 136),
('almacen_arm', 'Almacén de armas', 'En el almacén de armas, se guarda todo el armamento que no se necesita de inmediato. El proceso es automático, y se mantienen allí hasta que sean necesarias. Además, ningún enemigo podrá robártelas de este almacén.', 100, 500, 0, 9000, 0, 12),
('deposito', 'Depósito de munición', 'El depósito de munición funciona de forma similar al almacén de armas. Se guardan cajas de munición y granadas que no se vayan a usar de inmediato. Además, aquí están más seguras, a salvo del enemigo.', 500, 600, 0, 12000, 0, 18),
('almacen_alc', 'Almacén de alcohol', 'Ya que la destilación de alcohol es bastante sencilla, la producción es alta. Para poder almacenarlo sin perder el exceso de producción, necesitas construir un almacén de alcohol. En el mismo, estará a salvo de los enemigos.', 200, 200, 0, 8000, 0, 7),
('caja', 'Caja fuerte', 'Después de realizar un contrabando con éxito, conseguirás una buena cantidad de dólares. Pero, ¡presta atención!. Si no quieres tirar el dinero, debes usar esta caja, para prevenir que desaparezca, y para asegurarte liquidez.', 2000, 2000, 1000, 16000, 0, 91),
('campo', 'Campo de entrenamiento', 'Tal y como dice el nombre, en el campo de entrenamiento, tus "chicos" entrenarán. El mismo, dependerá según el tipo de unidades que puedas producir, por ejemplo, simples delincuentes, asesinos, profesionales, a los que tus enemigos tendrán un respeto extremo. Dependiendo del nivel, las unidades serán creadas en menor tiempo.', 1000, 2500, 0, 5600, 0, 61),
('seguridad', 'Seguridad', 'Al igual que el entrenamiento de luchadores en el campo de entrenamiento, aquí podrás entrenar a los más jóvenes en defensa. En principio, se quedarán permanentemente, siempre en el hogar, y protegiendo sus habitaciones contra enemigos. Si tus gángsters están de vuelta, automáticamente luchan juntos.', 0, 0, 0, 6000, 0, 45),
('torreta', 'Torreta de fuego automático', 'A fin de aliviar un poco el trabajo de los defensores, dispones de ciertas construcciones, como esta torreta de fuego automático. Técnicamente, son muy avanzadas, y en el momento en que detecten a un enemigo, abrirán fuego de golpe.', 1000, 2000, 200, 4500, 0, 57),
('minas', 'Minas ocultas', 'Estas minas son una ayuda incluso más "agradable". Tus chicos las repartirán a lo largo de la casa. Cuando algún enemigo la pise sin darse cuenta... ¡Buenas noches!', 2000, 2000, 150, 3000, 0, 65.5)
ON CONFLICT (id) DO NOTHING;

-- 2.3 Troops (Tropas)
INSERT INTO public.config_units (id, name, cost_armaments, cost_munitions, cost_dollars, base_duration, points, attack, defense, capacity, velocity, salary, type) VALUES
('maton', 'Maton', 200, 1000, 0, 1400, 6, 5, 5, 200, 1600, 1, 'attack'),
('portero', 'Portero', 500, 8000, 0, 1600, 6, 8, 6, 400, 2000, 1, 'defense'),
('acuchillador', 'Acuchillador', 1000, 200, 0, 2000, 4, 10, 4, 300, 2500, 1, 'attack'),
('pistolero', 'Pistolero', 2000, 3000, 0, 1200, 21, 30, 10, 500, 2400, 2, 'attack'),
('ocupacion', 'Tropa de Ocupacion', 20000, 10000, 20000, 344000, 251, 1, 10, 3000, 2000, 500, 'special'),
('espia', 'Espia', 500, 200, 0, 14000, 3, 1, 1, 50, 400000, 1, 'special'),
('porteador', 'Porteador', 300, 100, 1000, 3600, 9, 4, 6, 10000, 2400, 5, 'special'),
('cia', 'Agente de la CIA', 7000, 10000, 2500, 17000, 87, 100, 90, 3000, 3400, 30, 'attack'),
('fbi', 'Agente del FBI', 4000, 6000, 1000, 15500, 48, 60, 50, 2000, 3000, 20, 'attack'),
('transportista', 'Transportista', 1000, 2000, 5000, 17200, 51, 6, 8, 40000, 5000, 10, 'special'),
('francotirador', 'Francotirador', 4000, 500, 2000, 25000, 28, 200, 10, 1000, 6000, 20, 'attack'),
('asesino', 'Asesino', 10000, 15000, 10000, 6000, 176, 300, 200, 2000, 6500, 50, 'attack'),
('ninja', 'Ninja', 2000, 1000, 30000, 40000, 236, 400, 600, 5000, 8000, 60, 'attack'),
('mercenario', 'Mercenario', 80000, 120000, 50000, 144000, 1176, 1000, 1200, 12000, 4500, 300, 'attack'),
-- Defense specific units inferred from legacy arrays typically found in other contexts or config logic
('centinela', 'Centinela', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defense'),
('policia', 'Policia', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defense'),
('guardaespaldas', 'Guardaespaldas', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defense'),
('guardia', 'Guardia', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'defense')
ON CONFLICT (id) DO NOTHING;


-- -----------------------------------------------------------------------------
-- Part 3: Row Level Security (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alliances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alliance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.base_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_units ENABLE ROW LEVEL SECURITY;

-- 1. Configuration Tables (Public Read)
CREATE POLICY "Public read config buildings" ON public.config_buildings FOR SELECT USING (true);
CREATE POLICY "Public read config research" ON public.config_research FOR SELECT USING (true);
CREATE POLICY "Public read config units" ON public.config_units FOR SELECT USING (true);

-- 2. Profiles
-- Users can read all profiles (to see other players)
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
-- Users can update their own profile
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Bases
-- Users can read all bases (map view)
CREATE POLICY "Public read bases" ON public.bases FOR SELECT USING (true);
-- Users can update their own bases
CREATE POLICY "Update own bases" ON public.bases FOR UPDATE USING (auth.uid() = user_id);

-- 4. Private User Data (Research, Queues, Messages)
CREATE POLICY "Read own research" ON public.user_research FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Read own construction queue" ON public.construction_queue FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bases WHERE bases.id = construction_queue.base_id AND bases.user_id = auth.uid())
);
CREATE POLICY "Read own unit queue" ON public.unit_queue FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bases WHERE bases.id = unit_queue.base_id AND bases.user_id = auth.uid())
);
CREATE POLICY "Read own research queue" ON public.research_queue FOR SELECT USING (auth.uid() = user_id);

-- 5. Messages
CREATE POLICY "Read own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 6. Market
CREATE POLICY "Read active market offers" ON public.market_offers FOR SELECT USING (true);
CREATE POLICY "Update own market offers" ON public.market_offers FOR UPDATE USING (auth.uid() = seller_id);

-- 7. Alliances
CREATE POLICY "Public read alliances" ON public.alliances FOR SELECT USING (true);

-- 8. Map Movements
CREATE POLICY "Read own movements" ON public.map_movements FOR SELECT USING (auth.uid() = user_id);
-- In a real game, you might want to allow seeing incoming attacks:
CREATE POLICY "Read incoming movements" ON public.map_movements FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bases WHERE bases.id = map_movements.origin_base_id AND bases.user_id = auth.uid()) -- Outgoing
    OR
    EXISTS (SELECT 1 FROM public.bases WHERE bases.coord_x = map_movements.target_coord_x AND bases.coord_y = map_movements.target_coord_y AND bases.coord_z = map_movements.target_coord_z AND bases.user_id = auth.uid()) -- Incoming
);

COMMIT;
