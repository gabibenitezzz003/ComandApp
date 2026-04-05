import { Router } from "express";
import { ControladorComanda } from "../controladores/controlador-comanda";

export function crearRutasComanda(
  controlador: ControladorComanda,
  middlewareAuth: ReturnType<typeof import("../middlewares/middleware-autenticacion").crearMiddlewareAutenticacion>
): Router {
  const enrutador = Router();

  enrutador.post("/", middlewareAuth, (req, res, next) => controlador.crear(req, res, next));
  enrutador.patch("/:id/estado", middlewareAuth, (req, res, next) => controlador.cambiarEstado(req, res, next));
  enrutador.get("/", middlewareAuth, (req, res, next) => controlador.listarTodas(req, res, next));
  enrutador.get("/activas", middlewareAuth, (req, res, next) => controlador.listarActivas(req, res, next));
  enrutador.get("/mesa/:mesaId", middlewareAuth, (req, res, next) => controlador.listarPorMesa(req, res, next));
  enrutador.get("/mozo/:mozoId", middlewareAuth, (req, res, next) => controlador.listarPorMozo(req, res, next));
  enrutador.get("/estado/:estado", middlewareAuth, (req, res, next) => controlador.listarPorEstado(req, res, next));

  return enrutador;
}
