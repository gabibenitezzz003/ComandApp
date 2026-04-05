export class Mesa {
  readonly id: string;
  readonly numero: number;
  readonly capacidad: number;
  readonly activa: boolean;
  readonly tokenQr: string;
  readonly creadoEn: Date;
  readonly mozoAsignado?: { id: string; nombre: string } | null;

  constructor(parametros: {
    id: string;
    numero: number;
    capacidad: number;
    activa: boolean;
    tokenQr: string;
    creadoEn: Date;
    mozoAsignado?: { id: string; nombre: string } | null;
  }) {
    this.id = parametros.id;
    this.numero = parametros.numero;
    this.capacidad = parametros.capacidad;
    this.activa = parametros.activa;
    this.tokenQr = parametros.tokenQr;
    this.creadoEn = parametros.creadoEn;
    this.mozoAsignado = parametros.mozoAsignado;
  }
}
