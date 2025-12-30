
export type Training = {
    id: string;
    name: string;
    description: string;
    image: string;
    costs: {
        Armas?: number;
        Municion?: number;
        Dolares?: number;
    };
    duration: string;
};

export const trainingData: Training[] = [
    {
        id: "planificacion-rutas",
        name: "Planificacion de rutas",
        description: "Para ser más efectivos en llegar tan rápido como sea posible al objetivo, tus chicos deberían hacer este entrenamiento. Aquí aprenderán a planear rutas, viajar silenciosamente, y aproximarse al objetivo sin ser detectados, para llevar a cabo su trabajo tan efectivamente como sea posible.",
        image: "training-routes",
        costs: { Armas: 500, Municion: 1200 },
        duration: "00:11:07",
    },
    {
        id: "extorsion",
        name: "Extorsion",
        description: "Con ayuda de este entrenamiento tus chicos mejorarán notablemente cuando se trata de sacar dinero a base de extorsionar a tus enemigos. Esto se notará en la fuerza de combate que aumentará según el nivel alcanzado.",
        image: "training-extortion",
        costs: { Armas: 1000, Municion: 2000 },
        duration: "00:16:40",
    },
    {
        id: "espionaje",
        name: "Espionaje",
        description: "En este entrenamiento aprenderás las virtudes del espionaje por el cual tus espías podrán sacar información amplia y valiosa de tus enemigos.",
        image: "training-espionage",
        costs: { Armas: 500, Municion: 500, Dolares: 300 },
        duration: "00:23:20",
    },
    {
        id: "seguridad",
        name: "Seguridad",
        description: "Seguridad te permite desarrollar todos los sistemas necesarios para proteger tu edificio. A mayor nivel alcanzado mejor será tu defensa y tus chicos sabrán defenderse con mayor eficacia ante ataques.",
        image: "training-security",
        costs: { Armas: 1000, Municion: 4000, Dolares: 1000 },
        duration: "00:22:13",
    },
];
