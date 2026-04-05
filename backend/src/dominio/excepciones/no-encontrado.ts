import { ExcepcionDominio } from "./excepcion-dominio";

export class NoEncontrado extends ExcepcionDominio {
  constructor(entidad: string, identificador: string) {
    super(
      `${entidad} con identificador ${identificador} no encontrado`,
      "NO_ENCONTRADO",
      404
    );
    this.name = "NoEncontrado";
  }
}
