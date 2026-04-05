import { Comanda } from "../../dominio/entidades/comanda";

export interface ServicioWebSocket {
  emitirActualizacionComanda(comanda: Comanda): void;
  emitirNuevaComanda(comanda: Comanda): void;
  emitirPagoRegistrado(comandaId: string): void;
  emitirAMesa(mesaId: string, evento: string, datos: unknown): void;
  emitirAMozo(mozoId: string, evento: string, datos: unknown): void;
}
