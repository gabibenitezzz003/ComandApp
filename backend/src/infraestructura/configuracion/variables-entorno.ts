import { z } from "zod";

const esquemaVariables = z.object({
  DATABASE_URL: z.string().url(),
  PUERTO: z.string().transform(Number).pipe(z.number().int().positive()),
  JWT_SECRETO: z.string().min(10),
  GEMINI_API_KEY: z.string().min(1),
  CORS_ORIGEN: z.string().url(),
  TOKENS_MAXIMO_SESION: z.string().transform(Number).pipe(z.number().int().positive()).default("5000"),
});

type VariablesEntorno = z.infer<typeof esquemaVariables>;

let variablesCache: VariablesEntorno | null = null;

export function obtenerVariablesEntorno(): VariablesEntorno {
  if (variablesCache) {
    return variablesCache;
  }

  const resultado = esquemaVariables.safeParse(process.env);

  if (!resultado.success) {
    const errores = resultado.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Variables de entorno invalidas: ${errores}`);
  }

  variablesCache = resultado.data;
  return variablesCache;
}
