import jwt from "jsonwebtoken";
import { ServicioToken, DatosToken } from "../../aplicacion/interfaces-infraestructura/servicio-token";
import { NoAutorizado } from "../../dominio/excepciones/indice";

export class ServicioTokenJwt implements ServicioToken {
  constructor(private readonly secreto: string) {}

  generar(datos: DatosToken): string {
    return jwt.sign(datos, this.secreto, { expiresIn: "8h" });
  }

  verificar(token: string): DatosToken {
    try {
      const decodificado = jwt.verify(token, this.secreto) as DatosToken;
      return {
        usuarioId: decodificado.usuarioId,
        rol: decodificado.rol,
      };
    } catch {
      throw new NoAutorizado("Token invalido o expirado");
    }
  }
}
