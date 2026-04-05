import { z } from "zod";

export const esquemaCrearPago = z.object({
  comandaId: z.string().uuid(),
  metodo: z.enum(["EFECTIVO", "TARJETA", "QR_DIGITAL"]),
  referencia: z.string().nullable(),
});
