import { Request, Response, NextFunction } from "express";
import { ExcepcionDominio } from "../../dominio/excepciones/indice";
import { ZodError } from "zod";

interface RespuestaError {
  exito: false;
  error: {
    codigo: string;
    mensaje: string;
    detalles?: unknown;
  };
}

export function middlewareErrores(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ExcepcionDominio) {
    const respuesta: RespuestaError = {
      exito: false,
      error: {
        codigo: error.codigo,
        mensaje: error.message,
      },
    };
    res.status(error.codigoHttp).json(respuesta);
    return;
  }

  if (error instanceof ZodError) {
    const respuesta: RespuestaError = {
      exito: false,
      error: {
        codigo: "VALIDACION_FALLIDA",
        mensaje: "Datos de entrada invalidos",
        detalles: error.issues.map((issue) => ({
          campo: issue.path.join("."),
          mensaje: issue.message,
        })),
      },
    };
    res.status(400).json(respuesta);
    return;
  }

  const respuesta: RespuestaError = {
    exito: false,
    error: {
      codigo: "ERROR_INTERNO",
      mensaje: "Error interno del servidor",
    },
  };
  res.status(500).json(respuesta);
}
