export interface Research {
    id: string;
    nombre: string;
    descripcion: string;
    costo_armas: number;
    costo_municion: number;
    costo_dolares: number;
    duracion_base: number;
    nivel: number;
    requisitos_cumplidos: boolean;
}

export interface ResearchQueueItem {
    id: string;
    investigacion_id: string;
    nivel_destino: number;
    fin: string;
}
