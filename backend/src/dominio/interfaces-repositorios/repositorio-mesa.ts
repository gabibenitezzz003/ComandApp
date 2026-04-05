import { Mesa } from "../entidades/mesa";

export interface RepositorioMesa {
  obtenerPorId(id: string): Promise<Mesa | null>;
  obtenerPorToken(tokenQr: string): Promise<Mesa | null>;
  obtenerPorNumero(numero: number): Promise<Mesa | null>;
  obtenerTodas(): Promise<Mesa[]>;
  crear(mesa: Omit<Mesa, "id" | "creadoEn" | "tokenQr">): Promise<Mesa>;
  actualizar(id: string, datos: Partial<Pick<Mesa, "numero" | "capacidad" | "activa">> & { mozoAsignadoId?: string | null }): Promise<Mesa>;
  eliminar(id: string): Promise<void>;
}
