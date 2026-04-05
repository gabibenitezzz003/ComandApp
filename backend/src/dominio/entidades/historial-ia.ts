export class HistorialIa {
  readonly id: string;
  readonly sesionQr: string;
  readonly consulta: string;
  readonly respuesta: string;
  readonly tokensUsados: number;
  readonly contexto: string;
  readonly creadoEn: Date;

  constructor(parametros: {
    id: string;
    sesionQr: string;
    consulta: string;
    respuesta: string;
    tokensUsados: number;
    contexto: string;
    creadoEn: Date;
  }) {
    this.id = parametros.id;
    this.sesionQr = parametros.sesionQr;
    this.consulta = parametros.consulta;
    this.respuesta = parametros.respuesta;
    this.tokensUsados = parametros.tokensUsados;
    this.contexto = parametros.contexto;
    this.creadoEn = parametros.creadoEn;
  }
}
