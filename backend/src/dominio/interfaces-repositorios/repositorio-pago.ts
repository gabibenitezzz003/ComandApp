import { Pago, MetodoPago } from "../entidades/pago";

export interface CrearPagoDatos {
  comandaId: string;
  monto: number;
  metodo: MetodoPago;
  referencia: string | null;
}

export interface RepositorioPago {
  obtenerPorId(id: string): Promise<Pago | null>;
  obtenerPorComanda(comandaId: string): Promise<Pago | null>;
  crear(datos: CrearPagoDatos): Promise<Pago>;
}
