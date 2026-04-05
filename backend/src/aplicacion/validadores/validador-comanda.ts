import { z } from "zod";

export const esquemaCrearComanda = z.object({
  mesaId: z.string().uuid(),
  mozoId: z.string().uuid(),
  observaciones: z.string().nullable(),
  items: z
    .array(
      z.object({
        itemMenuId: z.string().uuid(),
        cantidad: z.number().int().positive(),
        notas: z.string().nullable(),
      })
    )
    .min(1),
});

export const esquemaActualizarEstado = z.object({
  comandaId: z.string().uuid(),
  nuevoEstado: z.enum([
    "RECIBIDO",
    "EN_PREPARACION",
    "LISTO_PARA_SERVIR",
    "ENTREGADO",
    "INCIDENCIA",
    "PAGADO",
  ]),
});
