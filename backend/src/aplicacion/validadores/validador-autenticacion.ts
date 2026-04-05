import { z } from "zod";

export const esquemaLogin = z.object({
  email: z.string().email(),
  clave: z.string().min(6),
});

export const esquemaRegistro = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  clave: z.string().min(6),
  rol: z.enum(["ADMIN", "MOZO", "COCINA"]),
});
