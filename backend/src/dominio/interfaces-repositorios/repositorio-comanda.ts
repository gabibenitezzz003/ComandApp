import { Comanda, EstadoComanda } from "../entidades/comanda";

export interface CrearComandaDatos {
  mesaId: string;
  mozoId: string;
  observaciones: string | null;
  items: {
    itemMenuId: string;
    cantidad: number;
    notas: string | null;
    precioUnitario: number;
  }[];
}

export interface RepositorioComanda {
  obtenerPorId(id: string): Promise<Comanda | null>;
  obtenerPorMesa(mesaId: string): Promise<Comanda[]>;
  obtenerPorMozo(mozoId: string): Promise<Comanda[]>;
  obtenerPorEstado(estado: EstadoComanda): Promise<Comanda[]>;
  obtenerTodas(): Promise<Comanda[]>;
  obtenerActivas(): Promise<Comanda[]>;
  crear(datos: CrearComandaDatos): Promise<Comanda>;
  actualizarEstado(id: string, estado: EstadoComanda): Promise<Comanda>;
  actualizarTotal(id: string, total: number): Promise<Comanda>;
}
