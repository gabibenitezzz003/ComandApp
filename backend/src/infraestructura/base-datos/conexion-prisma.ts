import { PrismaClient } from "@prisma/client";

let instancia: PrismaClient | null = null;

export function obtenerClientePrisma(): PrismaClient {
  if (!instancia) {
    instancia = new PrismaClient();
  }
  return instancia;
}

export async function desconectarPrisma(): Promise<void> {
  if (instancia) {
    await instancia.$disconnect();
    instancia = null;
  }
}
