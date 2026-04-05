import { RepositorioComanda } from "../../dominio/interfaces-repositorios/repositorio-comanda";
import { RepositorioPago } from "../../dominio/interfaces-repositorios/repositorio-pago";
import { ServicioEstadoComanda } from "../../dominio/servicios-dominio/servicio-estado-comanda";
import { ServicioWebSocket } from "../interfaces-infraestructura/servicio-websocket";
import { CrearPagoDto, RespuestaPagoDto } from "../dtos/dto-pago";
import { NoEncontrado, OperacionInvalida } from "../../dominio/excepciones/indice";

export class ProcesarPago {
  constructor(
    private readonly repositorioPago: RepositorioPago,
    private readonly repositorioComanda: RepositorioComanda,
    private readonly servicioEstadoComanda: ServicioEstadoComanda,
    private readonly servicioWebSocket: ServicioWebSocket
  ) {}

  async ejecutar(dto: CrearPagoDto): Promise<RespuestaPagoDto> {
    const comanda = await this.repositorioComanda.obtenerPorId(dto.comandaId);

    if (!comanda) {
      throw new NoEncontrado("Comanda", dto.comandaId);
    }

    const pagoExistente = await this.repositorioPago.obtenerPorComanda(dto.comandaId);

    if (pagoExistente) {
      throw new OperacionInvalida("La comanda ya tiene un pago registrado");
    }

    this.servicioEstadoComanda.validarTransicion(comanda.estado, "PAGADO");

    const pago = await this.repositorioPago.crear({
      comandaId: dto.comandaId,
      monto: comanda.total,
      metodo: dto.metodo,
      referencia: dto.referencia,
    });

    await this.repositorioComanda.actualizarEstado(dto.comandaId, "PAGADO");

    this.servicioWebSocket.emitirPagoRegistrado(dto.comandaId);

    return {
      id: pago.id,
      comandaId: pago.comandaId,
      monto: pago.monto,
      metodo: pago.metodo,
      referencia: pago.referencia,
      creadoEn: pago.creadoEn.toISOString(),
    };
  }
}
