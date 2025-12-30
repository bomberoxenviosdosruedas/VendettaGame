-- 1. Habitaciones (`configuracion_habitacion`)
INSERT INTO public.configuracion_habitacion
(id, nombre, descripcion, url_imagen, costo_armas, costo_municion, costo_dolares, duracion_construccion, produccion_base, recurso_producido, puntos)
VALUES
('oficina_del_jefe', 'Oficina del Jefe', 'Centro de mando y coordinación.', '/img/hab/oficina.webp', 100, 200, 0, 450, 0, NULL, 6),
('escuela_especializacion', 'Escuela de especialización', 'Entrenamiento de nuevas técnicas.', '/img/hab/escuela.webp', 1000, 1000, 0, 2000, 0, NULL, 31.75),
('armeria', 'Armería', 'Producción de armas.', '/img/hab/armeria.webp', 12, 60, 0, 250, 10, 'armas', 2.32),
('almacen_de_municion', 'Almacén de munición', 'Producción de munición.', '/img/hab/municion.webp', 9, 15, 0, 300, 20, 'municion', 1.39),
('cerveceria', 'Cervecería', 'Producción de alcohol.', '/img/hab/cerveceria.webp', 20, 20, 0, 500, 50, 'alcohol', 1.6),
('taberna', 'Taberna', 'Venta de alcohol local.', '/img/hab/taberna.webp', 10, 50, 0, 750, 2, 'dolares_por_alcohol', 2.1),
('contrabando', 'Contrabando', 'Venta masiva de alcohol.', '/img/hab/contrabando.webp', 2000, 5000, 500, 2000, 21, 'dolares_por_alcohol', 136),
('almacen_de_armas', 'Almacén de armas', 'Almacenamiento seguro de armas.', '/img/hab/almacen_arm.webp', 100, 500, 0, 1150, 0, NULL, 12),
('deposito_de_municion', 'Depósito de munición', 'Almacenamiento seguro de munición.', '/img/hab/deposito.webp', 500, 600, 0, 1350, 0, NULL, 18),
('almacen_de_alcohol', 'Almacén de alcohol', 'Almacenamiento seguro de alcohol.', '/img/hab/almacen_alc.webp', 200, 200, 0, 750, 0, NULL, 7),
('caja_fuerte', 'Caja fuerte', 'Protección de dólares.', '/img/hab/caja.webp', 1000, 1000, 500, 8000, 0, NULL, 91),
('campo_de_entrenamiento', 'Campo de entrenamiento', 'Entrenamiento de tropas de ataque.', '/img/hab/campo.webp', 1000, 2500, 0, 5600, 0, NULL, 61),
('seguridad', 'Seguridad', 'Entrenamiento de defensa.', '/img/hab/seguridad.webp', 900, 1600, 100, 6300, 0, NULL, 45),
('torreta_de_fuego_automatico', 'Torreta de fuego automático', 'Defensa automática.', '/img/hab/torreta.webp', 1000, 2000, 200, 4500, 0, NULL, 57),
('minas_ocultas', 'Minas ocultas', 'Defensa pasiva.', '/img/hab/minas.webp', 2000, 2000, 150, 7200, 0, NULL, 65.5)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    url_imagen = EXCLUDED.url_imagen,
    costo_armas = EXCLUDED.costo_armas,
    costo_municion = EXCLUDED.costo_municion,
    costo_dolares = EXCLUDED.costo_dolares,
    duracion_construccion = EXCLUDED.duracion_construccion,
    produccion_base = EXCLUDED.produccion_base,
    recurso_producido = EXCLUDED.recurso_producido,
    puntos = EXCLUDED.puntos;

-- 2. Entrenamientos (`configuracion_entrenamiento`)
INSERT INTO public.configuracion_entrenamiento
(id, nombre, url_imagen, costo_armas, costo_municion, costo_dolares, duracion_entrenamiento, puntos)
VALUES
('rutas', 'Planificacion de rutas', '/img/ent/rutas.webp', 500, 1200, 0, 2000, 15.5),
('encargos', 'Planificacion de encargos', '/img/ent/encargos.webp', 1000, 2500, 1000, 5000, 46),
('extorsion', 'Extorsion', '/img/ent/extorsion.webp', 1000, 2000, 0, 3000, 26),
('administracion', 'Administración de base', '/img/ent/administracion.webp', 0, 0, 5000, 14400, 76),
('contrabando', 'Contrabando', '/img/ent/contrabando.webp', 0, 0, 1500, 9600, 23.5),
('espionaje', 'Espionaje', '/img/ent/espionaje.webp', 500, 500, 300, 4200, 13),
('seguridad', 'Seguridad', '/img/ent/seguridad.webp', 1000, 4000, 1000, 4000, 61),
('proteccion', 'Proteccion de grupo', '/img/ent/proteccion.webp', 3000, 5000, 2000, 5000, 96),
('combate', 'Combate cuerpo a cuerpo', '/img/ent/combate.webp', 2000, 2000, 3000, 6200, 76),
('armas', 'Combate de armas a corta distancia', '/img/ent/armas.webp', 1000, 200, 3000, 5100, 53),
('tiro', 'Entrenamiento de Tiro', '/img/ent/tiro.webp', 5000, 12000, 10000, 19200, 296),
('explosivos', 'Fabricación de explosivos', '/img/ent/explosivos.webp', 10000, 19500, 15000, 42000, 471),
('guerrilla', 'Entrenamiento de guerrilla', '/img/ent/guerrilla.webp', 8000, 10000, 12000, 20000, 321),
('psicologico', 'Entrenamiento psicologico', '/img/ent/psicologico.webp', 2000, 5000, 16000, 26000, 301),
('quimico', 'Entrenamiento químico', '/img/ent/quimico.webp', 4000, 12000, 1000, 14400, 0),
('honor', 'Honor', '/img/ent/honor.webp', 0, 0, 280000, 92000, 4201)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    url_imagen = EXCLUDED.url_imagen,
    costo_armas = EXCLUDED.costo_armas,
    costo_municion = EXCLUDED.costo_municion,
    costo_dolares = EXCLUDED.costo_dolares,
    duracion_entrenamiento = EXCLUDED.duracion_entrenamiento,
    puntos = EXCLUDED.puntos;

-- 3. Tropas (`configuracion_tropa`)
INSERT INTO public.configuracion_tropa
(id, nombre, descripcion, url_imagen, costo_armas, costo_municion, costo_dolares, duracion_reclutamiento, ataque, defensa, capacidad_carga, velocidad, salario, puntos, tipo, requisitos, bonus_ataque, bonus_defensa)
VALUES
('acuchillador', 'Acuchillador', 'Sigiloso y rápido.', '/img/trp/acuchillador.webp', 1000, 200, 0, 2000, 10, 8, 300, 3000, 1, 4, 'ATAQUE', '{}', ARRAY['extorsion'], ARRAY['extorsion']),
('asesino', 'Asesino', 'Profesional del combate.', '/img/trp/asesino.webp', 10000, 15000, 10000, 6000, 300, 200, 2000, 6500, 50, 176, 'ATAQUE', '{}', ARRAY['seguridad'], ARRAY[]::text[]),
('centinela', 'Centinela', 'Defensa perimetral.', '/img/trp/centinela.webp', 30, 50, 0, 130, 5, 25, 0, 0, 3, 1.5, 'DEFENSA', '{"seguridad": 1}', ARRAY[]::text[], ARRAY['seguridad']),
('cia', 'Agente CIA', 'Inteligencia.', '/img/trp/cia.webp', 250, 300, 50, 400, 60, 40, 10, 130, 30, 12, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('demoliciones', 'Experto en Demoliciones', 'Destrucción.', '/img/trp/demolicion.webp', 400, 500, 100, 600, 70, 30, 15, 90, 35, 25, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('espia', 'Espía', 'Infiltración.', '/img/trp/espia.webp', 0, 0, 200, 300, 1, 1, 0, 200, 30, 5, 'ESPIONAJE', '{"espionaje": 1}', ARRAY['espionaje'], ARRAY['espionaje']),
('fbi', 'Agente FBI', 'Investigación federal.', '/img/trp/fbi.webp', 240, 280, 40, 380, 55, 45, 10, 125, 28, 11, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('francotirador', 'Francotirador', 'Muerte a distancia.', '/img/trp/francotirador.webp', 350, 200, 50, 550, 90, 10, 2, 140, 45, 22, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('guardaespaldas', 'Guardaespaldas', 'Protección de élite.', '/img/trp/guardaespaldas.webp', 150, 200, 50, 350, 30, 80, 0, 0, 25, 8, 'DEFENSA', '{"combate": 1, "proteccion": 1}', ARRAY[]::text[], ARRAY['proteccion','combate','tiro']),
('guardia_de_honor', 'Guardia de Honor', 'Defensa definitiva.', '/img/trp/guardia.webp', 300, 400, 100, 600, 50, 120, 0, 0, 50, 15, 'DEFENSA', '{"combate": 1, "tiro": 1, "psicologico": 1}', ARRAY[]::text[], ARRAY['proteccion','combate','tiro','psicologico']),
('maton', 'Matón', 'Fuerza bruta básica.', '/img/trp/maton.webp', 200, 1000, 0, 1400, 5, 10, 200, 1920, 1, 6, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('mercenario', 'Mercenario', 'Soldado de fortuna.', '/img/trp/mercenario.webp', 80000, 120000, 50000, 144000, 1000, 2400, 12000, 3000, 300, 1176, 'ATAQUE', '{}', ARRAY['espionaje','seguridad','proteccion','combate','armas','tiro','guerrilla','psicologico'], ARRAY['espionaje','seguridad','proteccion','combate','armas','tiro','guerrilla','psicologico']),
('ninja', 'Ninja', 'Artes marciales.', '/img/trp/ninja.webp', 200, 100, 50, 480, 75, 40, 10, 160, 38, 18, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('ocupacion', 'Tropa de Ocupación', 'Control de propiedades.', '/img/trp/ocupacion.webp', 50, 50, 100, 180, 5, 5, 0, 20000000, 15, 2.5, 'OCUPAR', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('pistolero', 'Pistolero', 'Precisión.', '/img/trp/pistolero.webp', 100, 100, 0, 200, 40, 20, 5, 110, 20, 3, 'ATAQUE', '{"tiro": 1}', ARRAY['tiro'], ARRAY['seguridad']),
('policia', 'Policía', 'Defensor.', '/img/trp/policia.webp', 80, 120, 0, 220, 15, 50, 0, 0, 10, 4, 'DEFENSA', '{"proteccion": 1}', ARRAY[]::text[], ARRAY['proteccion','combate']),
('porteador', 'Porteador', 'Transporte.', '/img/trp/porteador.webp', 10, 10, 0, 80, 2, 10, 500, 70, 3, 0.5, 'TRANSPORTE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('portero', 'Portero', 'Intimidación.', '/img/trp/portero.webp', 20, 50, 0, 120, 5, 15, 20, 80, 8, 1.2, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY['proteccion']),
('tactico', 'Experto Táctico', 'Estrategia.', '/img/trp/tactico.webp', 220, 220, 80, 420, 40, 60, 20, 110, 30, 15, 'ATAQUE', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('trabajador_ilegal', 'Trabajador Ilegal', 'Defensa barata.', '/img/trp/ilegal.webp', 10, 10, 0, 90, 1, 10, 0, 0, 1, 0.8, 'DEFENSA', '{}', ARRAY[]::text[], ARRAY[]::text[]),
('transportista', 'Transportista', 'Transporte pesado.', '/img/trp/transportista.webp', 50, 50, 200, 250, 5, 20, 2000, 60, 15, 5, 'TRANSPORTE', '{}', ARRAY[]::text[], ARRAY[]::text[])
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    url_imagen = EXCLUDED.url_imagen,
    costo_armas = EXCLUDED.costo_armas,
    costo_municion = EXCLUDED.costo_municion,
    costo_dolares = EXCLUDED.costo_dolares,
    duracion_reclutamiento = EXCLUDED.duracion_reclutamiento,
    ataque = EXCLUDED.ataque,
    defensa = EXCLUDED.defensa,
    capacidad_carga = EXCLUDED.capacidad_carga,
    velocidad = EXCLUDED.velocidad,
    salario = EXCLUDED.salario,
    puntos = EXCLUDED.puntos,
    tipo = EXCLUDED.tipo,
    requisitos = EXCLUDED.requisitos,
    bonus_ataque = EXCLUDED.bonus_ataque,
    bonus_defensa = EXCLUDED.bonus_defensa;
