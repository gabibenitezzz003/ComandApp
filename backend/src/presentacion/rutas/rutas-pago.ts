import { Router } from "express";
import { ControladorPago } from "../controladores/controlador-pago";

export function crearRutasPago(
  controlador: ControladorPago,
  middlewareAuth: ReturnType<typeof import("../middlewares/middleware-autenticacion").crearMiddlewareAutenticacion>
): Router {
  const enrutador = Router();

  enrutador.post("/", middlewareAuth, (req, res, next) => controlador.crear(req, res, next));

  return enrutador;
}
