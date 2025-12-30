export type Troop = {
    id: string;
    name: string;
    description: string;
    image: string;
    stats: {
        attack: number;
        defense: number;
        speed: number;
        capacity: number;
    };
    costs: {
        Armas?: number;
        Municion?: number;
        Alcohol?: number;
        Dolares?: number;
    };
    duration: string;
};

export const recruitmentData: Troop[] = [
    {
        id: "porteador",
        name: "Porteador",
        description: "Los porteadores son meras unidades civiles, que simplemente llevan cosas de aquí para allá. Por lo cual sólo los deberías utilizar como unidad de transporte y no como unidades de combate.",
        image: "troop-porteador",
        stats: { attack: 0, defense: 0, speed: 10, capacity: 1000 },
        costs: { Armas: 300, Municion: 100, Dolares: 1000 },
        duration: "01:00:00",
    },
    {
        id: "maton",
        name: "Matón",
        description: "Los Matones son unidades de combate simple, no dejarán escapar la oportunidad de atacar a cualquier unidad enemiga que detecte. En cantidades grandes incluso pueden ser muy peligrosos.",
        image: "troop-maton",
        stats: { attack: 10, defense: 5, speed: 10, capacity: 50 },
        costs: { Armas: 200, Municion: 1000 },
        duration: "00:23:20",
    },
    {
        id: "asesino",
        name: "Asesino",
        description: "El Asesino es una unidad especializada en el sigilo y la eliminación de objetivos clave. Alto ataque, pero baja defensa.",
        image: "troop-assassin",
        stats: { attack: 30, defense: 10, speed: 15, capacity: 20 },
        costs: { Armas: 150, Municion: 100, Dolares: 50 },
        duration: "00:05:00",
    },
    {
        id: "gorila",
        name: "Gorila",
        description: "El Gorila es la unidad de defensa principal. Con una gran cantidad de puntos de vida y defensa, son perfectos para proteger tu territorio.",
        image: "troop-enforcer",
        stats: { attack: 5, defense: 40, speed: 5, capacity: 10 },
        costs: { Armas: 80, Municion: 200, Alcohol: 10 },
        duration: "00:08:20",
    },
    {
        id: "consigliere",
        name: "Consigliere",
        description: "El Consigliere no es un luchador, pero reduce el costo de reclutamiento y construcción. Una unidad de apoyo invaluable.",
        image: "troop-consigliere",
        stats: { attack: 0, defense: 5, speed: 8, capacity: 5 },
        costs: { Dolares: 1000, Alcohol: 50 },
        duration: "00:15:00",
    },
];

export const recruitmentQueue = [
    { name: "Porteador", quantity: 1, duration: "00:59:59" }
]
