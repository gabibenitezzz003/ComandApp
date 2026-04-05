import { PrismaClient } from "@prisma/client";
import { RepositorioPago, CrearPagoDatos } from "../../dominio/interfaces-repositorios/repositorio-pago";
import { Pago, MetodoPago } from "../../dominio/entidades/pago";
import { Decimal } from "@prisma/client/runtime/library";

export class RepositorioPagoPrisma implements RepositorioPago {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorId(id: string): Promise<Pago | null> {
    const registro = await this.prisma.pago.findUnique({ where: { id } });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerPorComanda(comandaId: string): Promise<Pago | null> {
    const registro = await this.prisma.pago.findUnique({ where: { comandaId } });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async crear(datos: CrearPagoDatos): Promise<Pago> {
    const registro = await this.prisma.pago.create({
      data: {
        comandaId: datos.comandaId,
        monto: datos.monto,
        metodo: datos.metodo,
        referencia: datos.referencia,
      },
    });
    return this.mapearAEntidad(registro);
  }

  private mapearAEntidad(registro: {
    id: string;
    comandaId: string;
    monto: Decimal;
    metodo: string;
    referencia: string | null;
    creadoEn: Date;
  }): Pago {
    return new Pago({
      id: registro.id,
      comandaId: registro.comandaId,
      monto: Number(registro.monto),
      metodo: registro.metodo as MetodoPago,
      referencia: registro.referencia,
      creadoEn: registro.creadoEn,
    });
  }
}
