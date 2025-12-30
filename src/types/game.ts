import { z } from 'zod';

export const IniciarConstruccionSchema = z.object({
  propiedad_id: z.string().uuid(),
  habitacion_id: z.string().min(1),
});

export type IniciarConstruccionInput = z.infer<typeof IniciarConstruccionSchema>;
