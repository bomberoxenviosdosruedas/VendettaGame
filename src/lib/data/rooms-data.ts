export type Room = {
    id: string;
    name: string;
    level?: number;
    description: string;
    image: string;
    costs: {
        Armas?: number;
        Municion?: number;
        Dolares?: number;
    };
    duration: string;
    status: 'upgrade' | 'expand';
    upgradeLevel?: number;
};
  

export const roomsData: Room[] = [
    {
        id: "oficina_del_jefe",
        name: "Oficina del Jefe",
        level: 2,
        description: "El Jefe se encuentra en esta oficina, y aquí, se toman todas las decisiones. Coordina el desarrollo y la velocidad de construcción de las otras áreas. Cuando más nivel, más rápido se desarrollan el resto.",
        image: "room-office",
        costs: { Armas: 900, Municion: 1800 },
        duration: "00:22:30",
        status: 'upgrade',
        upgradeLevel: 3,
    },
    {
        id: "escuela_especializacion",
        name: "Escuela de especialización",
        description: "Como ya dice el nombre, esta habitación permite el entrenamiento de \"los chicos\" en nuevas ténicas, permitiéndoles tener más experiencia en combate. Al igual que para la oficina de El Jefe, cuánto más rápido se haga el entrenamiento, más rápido se desarrollan las habilidades.",
        image: "room-specialization",
        costs: { Armas: 1000, Municion: 1000, Dolares: 25 },
        duration: "00:05:33",
        status: 'expand',
    },
    {
        id: "armeria",
        name: "Armería",
        description: "Aquí, en la Armería, como dice el nombre, se guardan armas. Serán de gran necesidad para ocupar nuevos lugares, y para entrenamientos en combate. Cuanto mejor desarrollada esté, más armas podrás hacer al mismo tiempo.",
        image: "room-armory",
        costs: { Armas: 12, Municion: 60 },
        duration: "00:01:23",
        status: 'expand',
    },
    {
        id: "almacen_de_municion",
        name: "Almacén de munición",
        level: 1,
        description: "El almacén de munición es similar a la armería. Aquí, se manufactura la munición importante. Es necesaria, en grandes cantidades, al ocupar áreas, así como para su uso en entrenamientos. A diferencia de las armas, la munición se usa mucho más rápido.",
        image: "room-ammo",
        costs: { Armas: 36, Municion: 60 },
        duration: "00:06:40",
        status: 'upgrade',
        upgradeLevel: 2,
    },
    {
        id: "cerveceria",
        name: "Cervecería",
        description: "Esta habitación manufactura alcohol. Desgraciadamente (¿o afortunadamente?) está prohibido y por tanto, muy demandado por la población, así que es un negocio próspero. Sin embargo, necesitarás ciertas estrategias para poder llevarlo hasta los ciudadanos.",
        image: "room-brewery",
        costs: { Armas: 20, Municion: 20 },
        duration: "00:02:47",
        status: 'expand',
    },
    {
        id: "campo_de_entrenamiento",
        name: "Campo de entrenamiento",
        description: "Tal y como dice el nombre, en el campo de entrenamiento, tus \"chicos\" entrenarán. El mismo, dependerá según el tipo de unidades que puedas producir, por ejemplo, simples delincuentes, asesinos, profesionales, a los que tus enemigos tendrán un respeto extremo. Dependiendo del nivel, las unidades serán creadas en menor tiempo.",
        image: "room-training",
        costs: { Armas: 1000, Municion: 2500 },
        duration: "00:15:33",
        status: 'expand',
    },
];
