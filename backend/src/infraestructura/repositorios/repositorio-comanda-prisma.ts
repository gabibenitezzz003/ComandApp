import { PrismaClient } from "@prisma/client";
import {
  RepositorioComanda,
  CrearComandaDatos,
} from "../../dominio/interfaces-repositorios/repositorio-comanda";
import { Comanda, EstadoComanda, ItemComanda } from "../../dominio/entidades/comanda";
import { Decimal } from "@prisma/client/runtime/library";

interface RegistroComanda {
  id: string;
  mesaId: string;
  mozoId: string;
  estado: string;
  observaciones: string | null;
  total: Decimal;
  creadoEn: Date;
  actualizadoEn: Date;
  items: {
    id: string;
    comandaId: string;
    itemMenuId: string;
    cantidad: number;
    notas: string | null;
    precioUnitario: Decimal;
    itemMenu?: { nombre: string };
  }[];
  mesa?: { numero: number };
}

export class RepositorioComandaPrisma implements RepositorioComanda {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorId(id: string): Promise<Comanda | null> {
    const registro = await this.prisma.comanda.findUnique({
      where: { id },
      include: { 
          items: { include: { itemMenu: { select: { nombre: true } } } },
          mesa: { select: { numero: true } }
      },
    });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerPorMesa(mesaId: string): Promise<Comanda[]> {
    const registros = await this.prisma.comanda.findMany({
      where: { mesaId },
      include: { 
          items: { include: { itemMenu: { select: { nombre: true } } } },
          mesa: { select: { numero: true } }
      },
      orderBy: { creadoEn: "desc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerPorMozo(mozoId: string): Promise<Comanda[]> {
    const registros = await this.prisma.comanda.findMany({
      where: { mozoId },
      include: { 
          items: { include: { itemMenu: { select: { nombre: true } } } },
          mesa: { select: { numero: true } }
      },
      orderBy: { creadoEn: "desc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerPorEstado(estado: EstadoComanda): Promise<Comanda[]> {
    const registros = await this.prisma.comanda.findMany({
      where: { estado: estado as any },
      include: { 
          items: { include: { itemMenu: { select: { nombre: true } } } },
          mesa: { select: { numero: true } }
      },
      orderBy: { creadoEn: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerTodas(): Promise<Comanda[]> {
    const registros = await this.prisma.comanda.findMany({
      include: { 
          items: { include: { itemMenu: { select: { nombre: true } } } },
          mesa: { select: { numero: true } }
      },
      orderBy: { creadoEn: "desc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerActivas(): Promise<Comanda[]> {
    const registros = await this.prisma.comanda.findMany({
      where: {
        estado: { notIn: ["PAGADO"] },
      },
      include: { 
          items: { include: { itemMenu: { select: { nombre: true } } } },
          mesa: { select: { numero: true } }
      },
      orderBy: { creadoEn: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async crear(datos: CrearComandaDatos): Promise<Comanda> {
    const registro = await this.prisma.comanda.create({
      data: {
        mesaId: datos.mesaId,
        mozoId: datos.mozoId,
        observaciones: datos.observaciones,
        items: {
          create: datos.items.map((item) => ({
            itemMenuId: item.itemMenuId,
            cantidad: item.cantidad,
            notas: item.notas,
            precioUnitario: item.precioUnitario,
          })),
        },
      },
      include: { items: { include: { itemMenu: { select: { nombre: true } } } } },
    });
    return this.mapearAEntidad(registro);
  }

  async actualizarEstado(id: string, estado: EstadoComanda): Promise<Comanda> {
    const registro = await this.prisma.comanda.update({
      where: { id },
      data: { estado },
      include: { items: { include: { itemMenu: { select: { nombre: true } } } } },
    });
    return this.mapearAEntidad(registro);
  }

  async actualizarTotal(id: string, total: number): Promise<Comanda> {
    const registro = await this.prisma.comanda.update({
      where: { id },
      data: { total },
      include: { items: { include: { itemMenu: { select: { nombre: true } } } } },
    });
    return this.mapearAEntidad(registro);
  }

  private mapearAEntidad(registro: RegistroComanda): Comanda {
    return new Comanda({
      id: registro.id,
      mesaId: registro.mesaId,
      mozoId: registro.mozoId,
      estado: registro.estado as EstadoComanda,
      observaciones: registro.observaciones,
      total: Number(registro.total),
      mesaNumero: registro.mesa?.numero,
      creadoEn: registro.creadoEn,
      actualizadoEn: registro.actualizadoEn,
      items: registro.items.map(
        (item): ItemComanda => ({
          id: item.id,
          comandaId: item.comandaId,
          itemMenuId: item.itemMenuId,
          cantidad: item.cantidad,
          notas: item.notas,
          precioUnitario: Number(item.precioUnitario),
          nombreItem: item.itemMenu?.nombre,
        })
      ),
    });
  }
}
