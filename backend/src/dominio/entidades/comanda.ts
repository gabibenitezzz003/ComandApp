export type EstadoComanda =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "LISTO_PARA_SERVIR"
  | "ENTREGADO"
  | "INCIDENCIA"
  | "PAGADO";

export interface ItemComanda {
  readonly id: string;
  readonly comandaId: string;
  readonly itemMenuId: string;
  readonly cantidad: number;
  readonly notas: string | null;
  readonly precioUnitario: number;
  readonly nombreItem?: string;
}

export class Comanda {
  readonly id: string;
  readonly mesaId: string;
  readonly mozoId: string;
  readonly estado: EstadoComanda;
  readonly observaciones: string | null;
  readonly total: number;
  readonly mesaNumero?: number;
  readonly creadoEn: Date;
  readonly actualizadoEn: Date;
  readonly items: ItemComanda[];

  constructor(parametros: {
    id: string;
    mesaId: string;
    mozoId: string;
    estado: EstadoComanda;
    observaciones: string | null;
    total: number;
    mesaNumero?: number;
    creadoEn: Date;
    actualizadoEn: Date;
    items: ItemComanda[];
  }) {
    this.id = parametros.id;
    this.mesaId = parametros.mesaId;
    this.mozoId = parametros.mozoId;
    this.estado = parametros.estado;
    this.observaciones = parametros.observaciones;
    this.total = parametros.total;
    this.mesaNumero = parametros.mesaNumero;
    this.creadoEn = parametros.creadoEn;
    this.actualizadoEn = parametros.actualizadoEn;
    this.items = parametros.items;
  }
}
