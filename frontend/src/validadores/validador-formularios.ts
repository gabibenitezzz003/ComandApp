import { z } from "zod";

export const esquemaLogin = z.object({
  email: z.string().email("Email invalido"),
  clave: z.string().min(6, "Minimo 6 caracteres"),
});

export const esquemaPedido = z.object({
  observaciones: z.string().max(500).optional(),
});

export type DatosLogin = z.infer<typeof esquemaLogin>;
export type DatosPedido = z.infer<typeof esquemaPedido>;
