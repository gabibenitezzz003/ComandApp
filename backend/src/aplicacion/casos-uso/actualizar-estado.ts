import { RepositorioComanda } from "../../dominio/interfaces-repositorios/repositorio-comanda";
import { ServicioEstadoComanda } from "../../dominio/servicios-dominio/servicio-estado-comanda";
import { ServicioWebSocket } from "../interfaces-infraestructura/servicio-websocket";
import { ActualizarEstadoDto } from "../dtos/dto-comanda";
import { EstadoComanda } from "../../dominio/entidades/comanda";
import { NoEncontrado } from "../../dominio/excepciones/indice";

export class ActualizarEstado {
  constructor(
    private readonly repositorioComanda: RepositorioComanda,
    private readonly servicioEstadoComanda: ServicioEstadoComanda,
    private readonly servicioWebSocket: ServicioWebSocket
  ) {}

  async ejecutar(dto: ActualizarEstadoDto): Promise<{ id: string; estado: EstadoComanda }> {
    const comanda = await this.repositorioComanda.obtenerPorId(dto.comandaId);

    if (!comanda) {
      throw new NoEncontrado("Comanda", dto.comandaId);
    }

    this.servicioEstadoComanda.validarTransicion(comanda.estado, dto.nuevoEstado);

    const comandaActualizada = await this.repositorioComanda.actualizarEstado(
      dto.comandaId,
      dto.nuevoEstado
    );

    this.servicioWebSocket.emitirActualizacionComanda(comandaActualizada);

    return {
      id: comandaActualizada.id,
      estado: comandaActualizada.estado,
    };
  }
}
