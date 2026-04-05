import { Request, Response, NextFunction } from "express";
import { ServicioToken, DatosToken } from "../../aplicacion/interfaces-infraestructura/servicio-token";
import { NoAutorizado } from "../../dominio/excepciones/indice";

declare global {
  namespace Express {
    interface Request {
      usuarioAutenticado?: DatosToken;
    }
  }
}

export function crearMiddlewareAutenticacion(servicioToken: ServicioToken) {
  return function middlewareAutenticacion(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    const encabezadoAutorizacion = req.headers.authorization;

    if (!encabezadoAutorizacion) {
      throw new NoAutorizado("Token no proporcionado");
    }

    const [tipo, token] = encabezadoAutorizacion.split(" ");

    if (tipo !== "Bearer" || !token) {
      throw new NoAutorizado("Formato de token invalido");
    }

    const datosToken = servicioToken.verificar(token);
    req.usuarioAutenticado = datosToken;
    next();
  };
}

export function crearMiddlewareRol(...rolesPermitidos: string[]) {
  return function middlewareRol(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    if (!req.usuarioAutenticado) {
      throw new NoAutorizado("No autenticado");
    }

    if (!rolesPermitidos.includes(req.usuarioAutenticado.rol)) {
      throw new NoAutorizado("No tienes permisos para esta accion");
    }

    next();
  };
}
