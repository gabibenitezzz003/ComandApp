export class ExcepcionDominio extends Error {
  readonly codigo: string;
  readonly codigoHttp: number;

  constructor(mensaje: string, codigo: string, codigoHttp: number = 400) {
    super(mensaje);
    this.name = "ExcepcionDominio";
    this.codigo = codigo;
    this.codigoHttp = codigoHttp;
  }
}
