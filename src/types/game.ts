import { z } from 'zod';
import { Propiedad, ColaConstruccion as ColaConstruccionDB, AtaqueEntrante, ColaMisiones, Familia, MiembroFamilia } from './database';

export interface IncomingAttack extends AtaqueEntrante {}

export interface ActiveMission extends ColaMisiones {}

export interface FamilyInfo extends MiembroFamilia {
  familia: Familia | null;
}

export interface RecursoDetalle {
  val: number;
  max: number;
  prod: number;
}

export interface EdificioDetalle {
  id: string;
  nivel: number;
  nombre: string;
}

export interface TropaDetalle {
  id: string;
  cantidad: number;
  nombre: string;
}

export interface InvestigacionDetalle {
  id: string;
  nivel: number;
  nombre: string;
}

export interface ColaDetalle {
  id: string;
  habitacion_id?: string;
  entrenamiento_id?: string;
  tropa_id?: string;
  nivel_destino?: number;
  cantidad?: number;
  fecha_fin: string;
  nombre: string;
}

export interface Colas {
  construccion: ColaDetalle[];
  investigacion: ColaDetalle[];
  reclutamiento: ColaDetalle[];
}

export interface DashboardData {
  propiedad: Propiedad;
  recursos: {
    armas: RecursoDetalle;
    municion: RecursoDetalle;
    alcohol: RecursoDetalle;
    dolares: RecursoDetalle;
  };
  edificios: EdificioDetalle[];
  colas: Colas;
  tropas: TropaDetalle[];
  investigaciones: InvestigacionDetalle[];
  puntos: number;
}

export interface Recursos {
  armas: number;
  municion: number;
  alcohol: number;
  dolares: number;
}

export interface RespuestaConstruccion {
  success: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
  error?: string;
}

export type ColaConstruccion = Pick<ColaConstruccionDB, 'id' | 'propiedad_id' | 'habitacion_id' | 'nivel_destino' | 'fecha_fin'>;

export const IniciarConstruccionSchema = z.object({
  propiedad_id: z.string().uuid(),
  habitacion_id: z.string().min(1),
});
