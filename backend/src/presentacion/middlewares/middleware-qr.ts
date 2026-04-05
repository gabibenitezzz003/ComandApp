import { Request, Response, NextFunction } from "express";
import { RepositorioMesa } from "../../dominio/interfaces-repositorios/repositorio-mesa";
import { NoAutorizado } from "../../dominio/excepciones/indice";

declare global {
  namespace Express {
    interface Request {
      mesaQr?: {
        mesaId: string;
        tokenQr: string;
      };
    }
  }
}

export function crearMiddlewareQr(repositorioMesa: RepositorioMesa) {
  return async function middlewareQr(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    const tokenQr = String(req.params.tokenQr || req.headers["x-token-qr"] as string);

    if (!tokenQr) {
      throw new NoAutorizado("Token QR no proporcionado");
    }

    const mesa = await repositorioMesa.obtenerPorToken(tokenQr);

    if (!mesa) {
      throw new NoAutorizado("Token QR invalido");
    }

    if (!mesa.activa) {
      throw new NoAutorizado("Mesa no activa");
    }

    req.mesaQr = {
      mesaId: mesa.id,
      tokenQr: mesa.tokenQr,
    };

    next();
  };
}
