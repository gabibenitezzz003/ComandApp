import { EstadoComanda } from "../entidades/comanda";
import { OperacionInvalida } from "../excepciones/indice";

const TRANSICIONES_VALIDAS: Record<EstadoComanda, EstadoComanda[]> = {
  RECIBIDO: ["EN_PREPARACION", "INCIDENCIA"],
  EN_PREPARACION: ["LISTO_PARA_SERVIR", "INCIDENCIA"],
  LISTO_PARA_SERVIR: ["ENTREGADO", "INCIDENCIA"],
  ENTREGADO: ["PAGADO", "INCIDENCIA"],
  INCIDENCIA: ["RECIBIDO", "EN_PREPARACION"],
  PAGADO: [],
};

export class ServicioEstadoComanda {
  validarTransicion(estadoActual: EstadoComanda, nuevoEstado: EstadoComanda): void {
    const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new OperacionInvalida(
        `Transicion de ${estadoActual} a ${nuevoEstado} no permitida`
      );
    }
  }
}
