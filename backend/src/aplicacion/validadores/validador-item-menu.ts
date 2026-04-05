import { z } from "zod";

export const esquemaCrearItemMenu = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().min(5).max(500),
  precio: z.number().positive(),
  categoria: z.enum(["ENTRADA", "PLATO_PRINCIPAL", "POSTRE", "BEBIDA", "SNACK"]),
  imagenUrl: z.string().url().nullable(),
  tiempoPreparacion: z.number().int().positive(),
});

export const esquemaActualizarItemMenu = z.object({
  nombre: z.string().min(2).max(100).optional(),
  descripcion: z.string().min(5).max(500).optional(),
  precio: z.number().positive().optional(),
  categoria: z.enum(["ENTRADA", "PLATO_PRINCIPAL", "POSTRE", "BEBIDA", "SNACK"]).optional(),
  disponible: z.boolean().optional(),
  imagenUrl: z.string().url().nullable().optional(),
  tiempoPreparacion: z.number().int().positive().optional(),
});
