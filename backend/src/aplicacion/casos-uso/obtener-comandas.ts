import { RepositorioComanda } from "../../dominio/interfaces-repositorios/repositorio-comanda";
import { EstadoComanda, Comanda } from "../../dominio/entidades/comanda";

export interface ComandaResumidaDto {
  id: string;
  mesaId: string;
  mozoId: string;
  estado: EstadoComanda;
  total: number;
  cantidadItems: number;
  creadoEn: string;
  actualizadoEn: string;
}

export class ObtenerComandas {
  constructor(
    private readonly repositorioComanda: RepositorioComanda
  ) {}

  async obtenerTodas(): Promise<any[]> {
    const comandas = await this.repositorioComanda.obtenerTodas();
    return comandas.map(this.mapearDetalle);
  }

  async obtenerActivas(): Promise<any[]> {
    const comandas = await this.repositorioComanda.obtenerActivas();
    return comandas.map(this.mapearDetalle);
  }

  async obtenerPorMesa(mesaId: string): Promise<any[]> {
    const comandas = await this.repositorioComanda.obtenerPorMesa(mesaId);
    return comandas.map(this.mapearDetalle);
  }

  async obtenerPorMozo(mozoId: string): Promise<any[]> {
    const comandas = await this.repositorioComanda.obtenerPorMozo(mozoId);
    return comandas.map(this.mapearDetalle);
  }

  async obtenerPorEstado(estado: EstadoComanda): Promise<any[]> {
    const comandas = await this.repositorioComanda.obtenerPorEstado(estado);
    return comandas.map(this.mapearDetalle);
  }

  private mapearDetalle(comanda: Comanda) {
    return {
      id: comanda.id,
      mesaId: comanda.mesaId,
      mozoId: comanda.mozoId,
      estado: comanda.estado,
      total: comanda.total,
      mesaNumero: comanda.mesaNumero,
      observaciones: comanda.observaciones,
      creadoEn: comanda.creadoEn.toISOString(),
      actualizadoEn: comanda.actualizadoEn.toISOString(),
      items: comanda.items.map(i => ({
          id: i.id,
          itemMenuId: i.itemMenuId,
          nombreItem: i.nombreItem || "Menú",
          cantidad: i.cantidad,
          notas: i.notas,
          precioUnitario: i.precioUnitario,
          subtotal: i.cantidad * i.precioUnitario
      }))
    };
  }
}
