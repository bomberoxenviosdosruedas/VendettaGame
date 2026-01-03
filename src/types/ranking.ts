export interface RankingProfile {
    id: string;
    nombre_usuario: string;
    puntos_total: number;
    posicion_ranking?: number;
    alianza?: {
        etiqueta: string;
        nombre: string;
    };
    avatar_url?: string;
}
