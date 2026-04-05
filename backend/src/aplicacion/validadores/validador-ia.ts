import { z } from "zod";

export const esquemaConsultaIa = z.object({
  consulta: z.string().min(3).max(500),
  sesionQr: z.string().min(1),
});
