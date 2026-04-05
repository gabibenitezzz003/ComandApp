import { z } from "zod";

export const esquemaCrearMesa = z.object({
  numero: z.number().int().positive(),
  capacidad: z.number().int().positive().max(20),
});

export const esquemaActualizarMesa = z.object({
  numero: z.number().int().positive().optional(),
  capacidad: z.number().int().positive().max(20).optional(),
  activa: z.boolean().optional(),
  mozoAsignadoId: z.string().uuid().optional().nullable(),
});
