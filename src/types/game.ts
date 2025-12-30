import { z } from 'zod';
import { Propiedad, ColaConstruccion as ColaConstruccionDB } from './database';

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
