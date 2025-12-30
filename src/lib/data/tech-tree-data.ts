

export type Requirement = {
    name: string;
    level: number;
};
  
export type TechItem = {
    id: string;
    name: string;
    image: string;
    available: boolean;
    requirements: Requirement[];
};
  
export const roomsTechData: TechItem[] = [
    {
        id: "oficina-jefe",
        name: "Oficina del Jefe",
        image: "room-office",
        available: true,
        requirements: [],
    },
    {
        id: "escuela-especializacion",
        name: "Escuela de especialización",
        image: "room-specialization",
        available: true,
        requirements: [],
    },
    {
        id: "armeria",
        name: "Armería",
        image: "room-armory",
        available: true,
        requirements: [],
    },
    {
        id: "almacen-municion",
        name: "Almacén de munición",
        image: "room-ammo",
        available: true,
        requirements: [],
    },
    {
        id: "cerveceria",
        name: "Cervecería",
        image: "room-brewery",
        available: true,
        requirements: [],
    },
    {
        id: "taberna",
        name: "Taberna",
        image: "room-tavern",
        available: false,
        requirements: [{ name: "Cervecería", level: 1 }],
    },
    {
        id: "contrabando",
        name: "Contrabando",
        image: "room-contraband",
        available: false,
        requirements: [
            { name: "Oficina del Jefe", level: 5 },
            { name: "Cervecería", level: 8 }
        ],
    },
    {
        id: "almacen-armas",
        name: "Almacén de armas",
        image: "room-armory",
        available: false,
        requirements: [{ name: "Armería", level: 5 }],
    },
    {
        id: "deposito-municion",
        name: "Depósito de munición",
        image: "room-ammo",
        available: false,
        requirements: [{ name: "Almacén de munición", level: 5 }],
    },
    {
        id: "almacen-alcohol",
        name: "Almacén de alcohol",
        image: "room-brewery",
        available: false,
        requirements: [{ name: "Cervecería", level: 5 }],
    },
    {
        id: "caja-fuerte",
        name: "Caja fuerte",
        image: "room-vault",
        available: false,
        requirements: [{ name: "Taberna", level: 5 }],
    },
    {
        id: "campo-entrenamiento",
        name: "Campo de entrenamiento",
        image: "room-training",
        available: true,
        requirements: [],
    },
    {
        id: "seguridad",
        name: "Seguridad",
        image: "room-security",
        available: false,
        requirements: [{ name: "Campo de entrenamiento", level: 2 }],
    },
    {
        id: "torreta-fuego-automatico",
        name: "Torreta de fuego automático",
        image: "room-turret",
        available: false,
        requirements: [{ name: "Oficina del Jefe", level: 5 }],
    },
    {
        id: "minas-ocultas",
        name: "Minas ocultas",
        image: "room-mines",
        available: false,
        requirements: [{ name: "Oficina del Jefe", level: 5 }],
    },
];


export const trainingTechData: TechItem[] = [
    {
      id: "planificacion-rutas",
      name: "Planificación de rutas",
      image: "training-routes",
      available: true,
      requirements: [],
    },
    {
      id: "planificacion-encargos",
      name: "Planificación de encargos",
      image: "training-planning",
      available: false,
      requirements: [{ name: "Planificación de rutas", level: 4 }],
    },
    {
      id: "extorsion",
      name: "Extorsión",
      image: "training-extortion",
      available: true,
      requirements: [],
    },
    {
      id: "administracion-base",
      name: "Administración de base",
      image: "training-base-admin",
      available: false,
      requirements: [{ name: "Seguridad", level: 5 }],
    },
    {
      id: "contrabando-training",
      name: "Contrabando",
      image: "room-contraband",
      available: false,
      requirements: [{ name: "Planificación de encargos", level: 1 }],
    },
    {
      id: "espionaje",
      name: "Espionaje",
      image: "training-espionage",
      available: true,
      requirements: [],
    },
    {
      id: "seguridad",
      name: "Seguridad",
      image: "training-security",
      available: true,
      requirements: [],
    },
    {
      id: "proteccion-grupo",
      name: "Protección de grupo",
      image: "room-contraband",
      available: false,
      requirements: [{ name: "Seguridad", level: 4 }],
    },
    {
      id: "combate-cuerpo-a-cuerpo",
      name: "Combate cuerpo a cuerpo",
      image: "training-hand-combat",
      available: false,
      requirements: [{ name: "Extorsión", level: 3 }],
    },
    {
      id: "combate-armas-corta-distancia",
      name: "Combate de armas a corta distancia",
      image: "training-close-combat",
      available: false,
      requirements: [{ name: "Extorsión", level: 5 }],
    },
    {
      id: "entrenamiento-tiro",
      name: "Entrenamiento de Tiro",
      image: "training-shooting",
      available: false,
      requirements: [
        { name: "Combate de armas a corta distancia", level: 4 },
        { name: "Protección de grupo", level: 4 },
      ],
    },
    {
      id: "fabricacion-explosivos",
      name: "Fabricación de explosivos",
      image: "training-explosives",
      available: false,
      requirements: [
        { name: "Planificación de encargos", level: 4 },
        { name: "Combate cuerpo a cuerpo", level: 4 },
      ],
    },
    {
      id: "entrenamiento-guerrilla",
      name: "Entrenamiento de guerrilla",
      image: "training-guerrilla",
      available: false,
      requirements: [
        { name: "Seguridad", level: 6 },
        { name: "Entrenamiento de Tiro", level: 6 },
      ],
    },
    {
      id: "entrenamiento-psicologico",
      name: "Entrenamiento psicológico",
      image: "training-psychological",
      available: false,
      requirements: [{ name: "Entrenamiento de guerrilla", level: 4 }],
    },
    {
      id: "entrenamiento-quimico",
      name: "Entrenamiento Químico",
      image: "training-chemical",
      available: false,
      requirements: [
        { name: "Fabricación de explosivos", level: 4 },
        { name: "Entrenamiento psicológico", level: 4 },
      ],
    },
    {
      id: "honor",
      name: "Honor",
      image: "training-honor",
      available: false,
      requirements: [
        { name: "Espionaje", level: 8 },
        { name: "Contrabando", level: 8 },
      ],
    },
  ];
