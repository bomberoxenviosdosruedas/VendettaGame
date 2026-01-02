// src/types/database.ts

// Enums
export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada';
// Alias for typo compatibility if needed, though strictly we should use the correct one.
export type EstadoInvaticion = EstadoInvitacion; 

export type RolFamilia = 'miembro' | 'capitan' | 'lider';
export type CategoriaMensaje = 'jugador' | 'familia' | 'sistema' | 'batalla' | 'espionaje';
export type EstadoFlota = 'en_camino' | 'regresando' | 'estacionada' | 'combatiendo';
export type TipoMision = 'atacar' | 'transportar' | 'espiar' | 'colonizar' | 'recolectar';

// Interfaces for Tables
export interface Usuario {
  id: string; // uuid
  nombre_usuario: string;
  email: string;
  url_avatar?: string;
  nombre?: string;
  titulo?: string;
  rol?: string;
  primer_login?: boolean;
  ultimo_visto?: string; // timestamptz
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface HistorialAcceso {
  id: string; // uuid
  usuario_id?: string; // uuid
  fecha_acceso?: string; // timestamptz
  direccion_ip?: string;
  agente_usuario?: string;
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface PuntuacionUsuario {
  usuario_id: string; // uuid
  puntos_habitaciones?: number; // real
  puntos_tropas?: number; // real
  puntos_entrenamientos?: number; // real
  puntos_totales?: number; // real
  puntos_honor_atacante?: number; // real
  puntos_honor_defensor?: number; // real
  puntos_honor_totales?: number; // real
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ErroresConfiguracion {
  id: string; // uuid
  usuario_id?: string; // uuid
  mensaje_error?: string;
  fecha_creacion?: string; // timestamptz
}

export interface ConfiguracionHabitacion {
  id: string;
  nombre: string;
  descripcion?: string;
  url_imagen: string;
  costo_armas?: number; // bigint
  costo_municion?: number; // bigint
  costo_dolares?: number; // bigint
  duracion_construccion?: number; // integer
  produccion_base?: number; // real
  recurso_producido?: string;
  puntos?: number; // real
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ConfiguracionEntrenamiento {
  id: string;
  nombre: string;
  url_imagen: string;
  costo_armas?: number; // bigint
  costo_municion?: number; // bigint
  costo_dolares?: number; // bigint
  duracion_entrenamiento?: number; // integer
  puntos?: number; // real
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ConfiguracionTropa {
  id: string;
  nombre: string;
  descripcion?: string;
  url_imagen: string;
  costo_armas?: number; // bigint
  costo_municion?: number; // bigint
  costo_dolares?: number; // bigint
  duracion_reclutamiento?: number; // integer
  ataque?: number; // integer
  defensa?: number; // integer
  capacidad_carga?: number; // integer
  velocidad?: number; // bigint
  salario?: number; // integer
  puntos?: number; // real
  tipo: string;
  requisitos?: Record<string, any>; // jsonb
  bonus_ataque?: string[];
  bonus_defensa?: string[];
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface RequisitoHabitacion {
  id: string; // uuid
  habitacion_id?: string;
  habitacion_requerida_id?: string;
  nivel_requerido?: number; // integer
}

export interface RequisitoEntrenamiento {
  id: string; // uuid
  entrenamiento_id?: string;
  entrenamiento_requerido_id?: string;
  nivel_requerido?: number; // integer
}

export interface TropaBonusContrincante {
  id: string; // uuid
  tropa_atacante_id?: string;
  tropa_defensora_id?: string;
  factor_prioridad?: number; // real
}

export interface Propiedad {
  [x: string]: ReactNode;
  id: string; // uuid
  usuario_id?: string; // uuid
  nombre: string;
  coordenada_ciudad: number; // integer
  coordenada_barrio: number; // integer
  coordenada_edificio: number; // integer
  armas?: number; // bigint
  municion?: number; // bigint
  alcohol?: number; // bigint
  dolares?: number; // bigint
  ultima_recogida_recursos?: string; // timestamptz
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface HabitacionUsuario {
  id: string; // uuid
  propiedad_id?: string; // uuid
  habitacion_id?: string;
  nivel?: number; // smallint
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface TropaPropiedad {
  propiedad_id: string; // uuid
  tropa_id: string;
  cantidad?: number; // integer
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface TropaSeguridadPropiedad {
  propiedad_id: string; // uuid
  tropa_id: string;
  cantidad?: number; // integer
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface EntrenamientoUsuario {
  usuario_id: string; // uuid
  entrenamiento_id: string;
  nivel?: number; // integer
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ColaConstruccion {
  id: string; // uuid
  propiedad_id?: string; // uuid
  habitacion_id?: string;
  nivel_destino: number; // integer
  duracion_segundos: number; // integer
  fecha_inicio: string; // timestamptz
  fecha_fin?: string; // timestamptz
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ColaInvestigacion {
  id: string; // uuid
  usuario_id?: string; // uuid
  propiedad_id?: string; // uuid
  entrenamiento_id?: string;
  nivel_destino: number; // integer
  fecha_inicio: string; // timestamptz
  fecha_fin: string; // timestamptz
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ColaReclutamiento {
  id: string; // uuid
  propiedad_id?: string; // uuid
  tropa_id?: string;
  cantidad: number; // integer
  fecha_inicio: string; // timestamptz
  fecha_fin: string; // timestamptz
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface Familia {
  id: string; // uuid
  nombre: string;
  etiqueta: string;
  descripcion?: string;
  url_avatar?: string;
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface MiembroFamilia {
  usuario_id: string; // uuid
  familia_id?: string; // uuid
  rol?: RolFamilia;
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface InvitacionFamilia {
  id: string; // uuid
  familia_id?: string; // uuid
  usuario_id?: string; // uuid
  tipo: string;
  estado?: EstadoInvitacion;
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface AnuncioFamilia {
  id: string; // uuid
  familia_id?: string; // uuid
  autor_id?: string; // uuid
  contenido: string;
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ColaMisiones {
  id: string; // uuid
  usuario_id?: string; // uuid
  propiedad_origen_id?: string; // uuid
  tipo_mision: TipoMision;
  tropas: Record<string, any>; // jsonb
  recursos?: Record<string, any>; // jsonb
  origen_ciudad: number; // integer
  origen_barrio: number; // integer
  origen_edificio: number; // integer
  destino_ciudad: number; // integer
  destino_barrio: number; // integer
  destino_edificio: number; // integer
  fecha_inicio: string; // timestamptz
  fecha_llegada: string; // timestamptz
  fecha_regreso?: string; // timestamptz
  velocidad_flota: number; // integer
  duracion_viaje: number; // integer
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface ColaEventosFlota {
  id: string; // uuid
  datos: Record<string, any>; // jsonb
  estado?: string;
  fecha_ejecucion?: string; // timestamptz
  fecha_creacion?: string; // timestamptz
}

export interface InformeBatalla {
  id: string; // uuid
  atacante_id?: string; // uuid
  defensor_id?: string; // uuid
  coordenada_ciudad: number; // integer
  coordenada_barrio: number; // integer
  coordenada_edificio: number; // integer
  ganador: string;
  detalles: Record<string, any>; // jsonb
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface InformeEspionaje {
  id: string; // uuid
  atacante_id?: string; // uuid
  defensor_id?: string; // uuid
  detalles: Record<string, any>; // jsonb
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface Mensaje {
  id: string; // uuid
  remitente_id?: string; // uuid
  destinatario_id?: string; // uuid
  asunto: string;
  contenido: string;
  categoria?: CategoriaMensaje;
  informe_batalla_id?: string; // uuid
  informe_espionaje_id?: string; // uuid
  leido?: boolean;
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}

export interface AtaqueEntrante {
  id: string; // uuid
  defensor_id?: string; // uuid
  atacante_id?: string; // uuid
  nombre_atacante: string;
  propiedad_objetivo: string;
  total_tropas: number; // integer
  fecha_llegada: string; // timestamptz
  mision_id?: string; // uuid
  fecha_creacion?: string; // timestamptz
  fecha_actualizacion?: string; // timestamptz
}
