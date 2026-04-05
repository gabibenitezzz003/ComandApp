import { PrismaClient } from "@prisma/client";
import { RepositorioMesa } from "../../dominio/interfaces-repositorios/repositorio-mesa";
import { Mesa } from "../../dominio/entidades/mesa";

export class RepositorioMesaPrisma implements RepositorioMesa {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorId(id: string): Promise<Mesa | null> {
    const registro = await this.prisma.mesa.findUnique({
      where: { id },
      include: { mozoAsignado: { select: { id: true, nombre: true } } },
    });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerPorToken(tokenQr: string): Promise<Mesa | null> {
    const registro = await this.prisma.mesa.findUnique({
      where: { tokenQr },
      include: { mozoAsignado: { select: { id: true, nombre: true } } },
    });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerPorNumero(numero: number): Promise<Mesa | null> {
    const registro = await this.prisma.mesa.findUnique({
      where: { numero },
      include: { mozoAsignado: { select: { id: true, nombre: true } } },
    });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerTodas(): Promise<Mesa[]> {
    const registros = await this.prisma.mesa.findMany({
      orderBy: { numero: "asc" },
      include: { mozoAsignado: { select: { id: true, nombre: true } } },
    });
    return registros.map(this.mapearAEntidad);
  }

  async crear(mesa: Omit<Mesa, "id" | "creadoEn" | "tokenQr">): Promise<Mesa> {
    const registro = await this.prisma.mesa.create({
      data: {
        numero: mesa.numero,
        capacidad: mesa.capacidad,
        activa: mesa.activa,
      },
      include: { mozoAsignado: { select: { id: true, nombre: true } } },
    });
    return this.mapearAEntidad(registro);
  }

  async actualizar(
    id: string,
    datos: Partial<Pick<Mesa, "numero" | "capacidad" | "activa">> & { mozoAsignadoId?: string | null }
  ): Promise<Mesa> {
    const registro = await this.prisma.mesa.update({
      where: { id },
      data: datos,
      include: { mozoAsignado: { select: { id: true, nombre: true } } },
    });
    return this.mapearAEntidad(registro);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.mesa.delete({ where: { id } });
  }

  private mapearAEntidad(registro: {
    id: string;
    numero: number;
    capacidad: number;
    activa: boolean;
    tokenQr: string;
    creadoEn: Date;
    mozoAsignado?: { id: string; nombre: string } | null;
  }): Mesa {
    return new Mesa({
      id: registro.id,
      numero: registro.numero,
      capacidad: registro.capacidad,
      activa: registro.activa,
      tokenQr: registro.tokenQr,
      creadoEn: registro.creadoEn,
      mozoAsignado: registro.mozoAsignado,
    });
  }
}
