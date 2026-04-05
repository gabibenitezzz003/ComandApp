import { ExcepcionDominio } from "./excepcion-dominio";

export class NoAutorizado extends ExcepcionDominio {
  constructor(mensaje: string = "No autorizado") {
    super(mensaje, "NO_AUTORIZADO", 401);
    this.name = "NoAutorizado";
  }
}
