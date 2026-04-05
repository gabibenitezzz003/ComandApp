export type MetodoPago = "EFECTIVO" | "TARJETA" | "QR_DIGITAL";

export class Pago {
  readonly id: string;
  readonly comandaId: string;
  readonly monto: number;
  readonly metodo: MetodoPago;
  readonly referencia: string | null;
  readonly creadoEn: Date;

  constructor(parametros: {
    id: string;
    comandaId: string;
    monto: number;
    metodo: MetodoPago;
    referencia: string | null;
    creadoEn: Date;
  }) {
    this.id = parametros.id;
    this.comandaId = parametros.comandaId;
    this.monto = parametros.monto;
    this.metodo = parametros.metodo;
    this.referencia = parametros.referencia;
    this.creadoEn = parametros.creadoEn;
  }
}
