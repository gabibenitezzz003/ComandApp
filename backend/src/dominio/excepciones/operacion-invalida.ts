import { ExcepcionDominio } from "./excepcion-dominio";

export class OperacionInvalida extends ExcepcionDominio {
  constructor(mensaje: string) {
    super(mensaje, "OPERACION_INVALIDA", 422);
    this.name = "OperacionInvalida";
  }
}
