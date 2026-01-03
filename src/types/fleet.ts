export interface FleetMovement {
    id: string;
    perfil_id: string;
    propiedad_origen_id: string;
    destino_x: number;
    destino_y: number;
    destino_z: number;
    tipo_mision: 'atacar' | 'transportar' | 'espiar' | 'ocupar';
    tropas: Record<string, number>;
    recursos: Record<string, number>;
    salida: string;
    llegada: string;
    regreso?: string;
}

export interface FleetContext {
    movements: FleetMovement[];
    availableTroops: Record<string, number>;
}
