import { RepositorioComanda } from "../../dominio/interfaces-repositorios/repositorio-comanda";
import { RepositorioItemMenu } from "../../dominio/interfaces-repositorios/repositorio-item-menu";
import { RepositorioMesa } from "../../dominio/interfaces-repositorios/repositorio-mesa";
import { ServicioWebSocket } from "../interfaces-infraestructura/servicio-websocket";
import { CrearComandaDto, RespuestaComandaDto } from "../dtos/dto-comanda";
import { NoEncontrado, OperacionInvalida } from "../../dominio/excepciones/indice";

export class CrearComanda {
  constructor(
    private readonly repositorioComanda: RepositorioComanda,
    private readonly repositorioItemMenu: RepositorioItemMenu,
    private readonly repositorioMesa: RepositorioMesa,
    private readonly servicioWebSocket: ServicioWebSocket
  ) {}

  async ejecutar(dto: CrearComandaDto): Promise<RespuestaComandaDto> {
    const mesa = await this.repositorioMesa.obtenerPorId(dto.mesaId);

    if (!mesa) {
      throw new NoEncontrado("Mesa", dto.mesaId);
    }

    if (!mesa.activa) {
      throw new OperacionInvalida("La mesa no esta activa");
    }

    const itemsConPrecio = await this.resolverPrecios(dto.items);
    const total = this.calcularTotal(itemsConPrecio);

    const comanda = await this.repositorioComanda.crear({
      mesaId: dto.mesaId,
      mozoId: dto.mozoId,
      observaciones: dto.observaciones,
      items: itemsConPrecio,
    });

    await this.repositorioComanda.actualizarTotal(comanda.id, total);

    const comandaActualizada = await this.repositorioComanda.obtenerPorId(comanda.id);

    if (!comandaActualizada) {
      throw new NoEncontrado("Comanda", comanda.id);
    }

    this.servicioWebSocket.emitirNuevaComanda(comandaActualizada);

    return this.mapearARespuesta(comandaActualizada, mesa.numero);
  }

  private async resolverPrecios(
    items: CrearComandaDto["items"]
  ): Promise<{ itemMenuId: string; cantidad: number; notas: string | null; precioUnitario: number }[]> {
    const resultado = [];

    for (const item of items) {
      const itemMenu = await this.repositorioItemMenu.obtenerPorId(item.itemMenuId);

      if (!itemMenu) {
        throw new NoEncontrado("ItemMenu", item.itemMenuId);
      }

      if (!itemMenu.disponible) {
        throw new OperacionInvalida(`El item ${itemMenu.nombre} no esta disponible`);
      }

      resultado.push({
        itemMenuId: item.itemMenuId,
        cantidad: item.cantidad,
        notas: item.notas,
        precioUnitario: itemMenu.precio,
      });
    }

    return resultado;
  }

  private calcularTotal(
    items: { cantidad: number; precioUnitario: number }[]
  ): number {
    return items.reduce(
      (acumulador, item) => acumulador + item.cantidad * item.precioUnitario,
      0
    );
  }

  private mapearARespuesta(
    comanda: { id: string; mesaId: string; mozoId: string; estado: string; observaciones: string | null; total: number; creadoEn: Date; actualizadoEn: Date; items: { id: string; itemMenuId: string; cantidad: number; notas: string | null; precioUnitario: number }[] },
    mesaNumero: number
  ): RespuestaComandaDto {
    return {
      id: comanda.id,
      mesaId: comanda.mesaId,
      mesaNumero,
      mozoId: comanda.mozoId,
      mozoNombre: "",
      estado: comanda.estado as RespuestaComandaDto["estado"],
      observaciones: comanda.observaciones,
      total: comanda.total,
      items: comanda.items.map((item) => ({
        id: item.id,
        itemMenuId: item.itemMenuId,
        nombreItem: "",
        cantidad: item.cantidad,
        notas: item.notas,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      })),
      creadoEn: comanda.creadoEn.toISOString(),
      actualizadoEn: comanda.actualizadoEn.toISOString(),
    };
  }
}
