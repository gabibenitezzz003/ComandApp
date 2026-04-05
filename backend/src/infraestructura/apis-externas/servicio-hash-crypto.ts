import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { ServicioHash } from "../../aplicacion/interfaces-infraestructura/servicio-hash";

export class ServicioHashCrypto implements ServicioHash {
  async hashear(texto: string): Promise<string> {
    const sal = randomBytes(16).toString("hex");
    const hash = createHash("sha256")
      .update(sal + texto)
      .digest("hex");
    return `${sal}:${hash}`;
  }

  async comparar(texto: string, hashAlmacenado: string): Promise<boolean> {
    const [sal, hashOriginal] = hashAlmacenado.split(":");

    if (!sal || !hashOriginal) {
      return false;
    }

    const hashCalculado = createHash("sha256")
      .update(sal + texto)
      .digest("hex");

    const bufferOriginal = Buffer.from(hashOriginal, "hex");
    const bufferCalculado = Buffer.from(hashCalculado, "hex");

    return timingSafeEqual(bufferOriginal, bufferCalculado);
  }
}
