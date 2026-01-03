export interface Alliance {
    id: string;
    legacy_id?: number;
    nombre: string;
    etiqueta: string;
    descripcion?: string;
    logo_url?: string;
    sitio_web?: string;
    creado_en: string;
}

export interface AllianceMember {
    id: string;
    alianza_id: string;
    perfil_id: string;
    rango: 'Lider' | 'Colider' | 'Miembro';
    unido_en: string;
    perfil: {
        nombre_usuario: string;
        ultimo_activo: string;
        puntos_total: number;
        avatar_url?: string;
    };
}

export interface AllianceRequest {
    id: string;
    perfil_id: string;
    alianza_id: string;
    mensaje: string;
    fecha: string;
    perfil: {
        nombre_usuario: string;
        puntos_total: number;
        avatar_url?: string;
    };
}

export interface AllianceWar {
    id: string;
    alianza1_id: string;
    alianza2_id: string;
    fecha_inicio: string;
    fecha_fin?: string;
    declaracion: string;
    ganador_id?: string;
    puntos_perdidos_alianza1: number;
    puntos_perdidos_alianza2: number;
    alianza_enemiga?: {
        nombre: string;
        etiqueta: string;
    };
}

export interface AllianceData {
    alliance: Alliance;
    members: AllianceMember[];
    requests: AllianceRequest[];
    wars: AllianceWar[];
    userRank: 'Lider' | 'Colider' | 'Miembro' | null;
}
