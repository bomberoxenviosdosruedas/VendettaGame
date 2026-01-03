export interface Message {
    id: string;
    remitente_id: string | null;
    destinatario_id: string;
    asunto: string;
    cuerpo: string;
    leido: boolean;
    creado_en: string;
    remitente?: {
        nombre_usuario: string;
        avatar_url?: string;
    };
    destinatario?: {
        nombre_usuario: string;
    };
}

export interface MessageFolder {
    inbox: Message[];
    sent: Message[];
    unreadCount: number;
}
