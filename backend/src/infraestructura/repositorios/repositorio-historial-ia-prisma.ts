import { PrismaClient } from "@prisma/client";
import {
  RepositorioHistorialIa,
  CrearHistorialIaDatos,
} from "../../dominio/interfaces-repositorios/repositorio-historial-ia";
import { HistorialIa } from "../../dominio/entidades/historial-ia";

export class RepositorioHistorialIaPrisma implements RepositorioHistorialIa {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(datos: CrearHistorialIaDatos): Promise<HistorialIa> {
    const registro = await this.prisma.historialIa.create({
      data: {
        sesionQr: datos.sesionQr,
        consulta: datos.consulta,
        respuesta: datos.respuesta,
        tokensUsados: datos.tokensUsados,
        contexto: datos.contexto,
      },
    });
    return this.mapearAEntidad(registro);
  }

  async obtenerPorSesion(sesionQr: string): Promise<HistorialIa[]> {
    const registros = await this.prisma.historialIa.findMany({
      where: { sesionQr },
      orderBy: { creadoEn: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerTokensTotalesPorSesion(sesionQr: string): Promise<number> {
    const resultado = await this.prisma.historialIa.aggregate({
      where: { sesionQr },
      _sum: { tokensUsados: true },
    });
    return resultado._sum.tokensUsados ?? 0;
  }

  private mapearAEntidad(registro: {
    id: string;
    sesionQr: string;
    consulta: string;
    respuesta: string;
    tokensUsados: number;
    contexto: string;
    creadoEn: Date;
  }): HistorialIa {
    return new HistorialIa({
      id: registro.id,
      sesionQr: registro.sesionQr,
      consulta: registro.consulta,
      respuesta: registro.respuesta,
      tokensUsados: registro.tokensUsados,
      contexto: registro.contexto,
      creadoEn: registro.creadoEn,
    });
  }
}
