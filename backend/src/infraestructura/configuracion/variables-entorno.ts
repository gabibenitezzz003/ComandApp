import { z } from "zod";

const esquemaVariables = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.string().optional(),
  PUERTO: z.string().optional(),
  JWT_SECRETO: z.string().min(10),
  GEMINI_API_KEY: z.string().min(1),
  CORS_ORIGEN: z.string().min(1),
  TOKENS_MAXIMO_SESION: z.string().transform(Number).pipe(z.number().int().positive()).default("5000"),
  // n8n (opcionales — si no están, el servicio opera en modo silencioso)
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_SECRET:      z.string().optional(),
});

type VariablesEntorno = z.infer<typeof esquemaVariables>;

let variablesCache: VariablesEntorno | null = null;

export function obtenerVariablesEntorno(): VariablesEntorno {
  if (variablesCache) return variablesCache;

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

export function obtenerPuerto(): number {
  return Number(process.env.PORT) || Number(process.env.PUERTO) || 3001;
}

export function obtenerOrigenesCors(corsOrigen: string): string[] {
  return corsOrigen.split(",").map((o) => o.trim());
}

export function obtenerConfigN8n(): { webhookUrl?: string; secret?: string } {
  return {
    webhookUrl: process.env.N8N_WEBHOOK_URL,
    secret:     process.env.N8N_SECRET,
  };
}
