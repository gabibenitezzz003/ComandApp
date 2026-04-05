import { Router } from "express";
import { ControladorMenu } from "../controladores/controlador-menu";

export function crearRutasMenu(
  controlador: ControladorMenu,
  middlewareAuth: ReturnType<typeof import("../middlewares/middleware-autenticacion").crearMiddlewareAutenticacion>,
  middlewareRolAdmin: ReturnType<typeof import("../middlewares/middleware-autenticacion").crearMiddlewareRol>
): Router {
  const enrutador = Router();

  enrutador.get("/", (req, res, next) => controlador.listarDisponibles(req, res, next));
  enrutador.get("/categoria/:categoria", (req, res, next) => controlador.listarPorCategoria(req, res, next));
  enrutador.post("/", middlewareAuth, middlewareRolAdmin, (req, res, next) => controlador.crear(req, res, next));
  enrutador.put("/:id", middlewareAuth, middlewareRolAdmin, (req, res, next) => controlador.actualizar(req, res, next));
  enrutador.delete("/:id", middlewareAuth, middlewareRolAdmin, (req, res, next) => controlador.eliminar(req, res, next));

  return enrutador;
}
