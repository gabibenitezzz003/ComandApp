import { Router } from "express";
import { ControladorMesa } from "../controladores/controlador-mesa";

export function crearRutasMesa(
  controlador: ControladorMesa,
  middlewareAuth: ReturnType<typeof import("../middlewares/middleware-autenticacion").crearMiddlewareAutenticacion>,
  middlewareRolAdmin: ReturnType<typeof import("../middlewares/middleware-autenticacion").crearMiddlewareRol>
): Router {
  const enrutador = Router();

  enrutador.get("/", middlewareAuth, (req, res, next) => controlador.listar(req, res, next));
  enrutador.get("/qr/:tokenQr", (req, res, next) => controlador.obtenerPorToken(req, res, next));
  enrutador.post("/", middlewareAuth, middlewareRolAdmin, (req, res, next) => controlador.crear(req, res, next));
  enrutador.put("/:id", middlewareAuth, middlewareRolAdmin, (req, res, next) => controlador.actualizar(req, res, next));

  return enrutador;
}
