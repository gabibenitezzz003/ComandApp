import { PrismaClient } from "@prisma/client";

let instancia: PrismaClient | null = null;

export function obtenerClientePrisma(): PrismaClient {
  if (!instancia) {
    instancia = new PrismaClient({
      log: ["error", "warn"],
    });
  }
  return instancia;
}

export async function conectarPrisma(): Promise<void> {
  const cliente = obtenerClientePrisma();
  await cliente.$connect();
  console.log("✅ Prisma conectado a la base de datos");
}

export async function conectarConRetry(intentos = 5): Promise<void> {
  try {
    await conectarPrisma();
  } catch (error) {
    if (intentos <= 1) throw error;
    console.log(`🔁 Reintentando conexion DB... (quedan ${intentos - 1})`);
    await new Promise((res) => setTimeout(res, 3000));
    return conectarConRetry(intentos - 1);
  }
}

export async function desconectarPrisma(): Promise<void> {
  if (instancia) {
    await instancia.$disconnect();
    instancia = null;
    console.log("🔌 Prisma desconectado");
  }
}
