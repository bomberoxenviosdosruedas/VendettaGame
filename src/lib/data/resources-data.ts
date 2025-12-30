export const totalProductionData = [
    { resource: 'Armas', hour: 10, day: 240 },
    { resource: 'Municion', hour: 20, day: 480 },
    { resource: 'Alcohol', hour: 60, day: 1440 },
    { resource: 'Dolares', hour: 0, day: 0 },
];
  
export const buildingProductionData = {
    baseSalary: { armas: 10, municion: 10, alcohol: 10, dolares: 0 },
    buildings: [
        { name: 'Almacén de munición', level: 1, production: { armas: 0, municion: 10, alcohol: 0, dolares: 0 } },
        { name: 'Cervecería', level: 1, production: { armas: 0, municion: 0, alcohol: 50, dolares: 0 } },
    ],
    storage: {
        capacity: { armas: 10000, municion: 10000, alcohol: 10000, dolares: 10000 },
        safe: { armas: 1000, municion: 1000, alcohol: 1000, dolares: 1000 },
    }
};