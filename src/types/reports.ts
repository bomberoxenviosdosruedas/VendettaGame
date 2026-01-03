export interface BattleReport {
    id: string;
    atacante_id: string | null;
    defensor_id: string | null;
    resultado: 'atacante_gana' | 'defensor_gana' | 'empate';
    puntos_ganados_atacante: number;
    puntos_ganados_defensor: number;
    recursos_robados: {
        armas: number;
        municion: number;
        alcohol: number;
        dolares: number;
    };
    detalle_log: any; // Complex JSON structure for combat rounds
    fecha: string;
    atacante?: { nombre_usuario: string };
    defensor?: { nombre_usuario: string };
}
