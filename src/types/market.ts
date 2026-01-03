export interface MarketOffer {
    id: string;
    vendedor_id: string;
    recurso: 'armas' | 'municion' | 'alcohol' | 'dolares';
    cantidad: number;
    pide_armas: number;
    pide_municion: number;
    pide_dolares: number;
    creado_en: string;
    expira_en: string;
    vendedor?: {
        nombre_usuario: string;
        avatar_url?: string;
    };
}

export type ResourceType = 'armas' | 'municion' | 'alcohol' | 'dolares';
