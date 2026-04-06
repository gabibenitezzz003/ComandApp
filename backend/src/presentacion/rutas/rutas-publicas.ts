import { Router } from "express";
import { ControladorPublico } from "../controladores/controlador-publico";

export function crearRutasPublicas(controlador: ControladorPublico): Router {
  const enrutador = Router();

  enrutador.get("/mesas/:tokenQr", (req, res, next) => controlador.obtenerInfoMesa(req, res, next));
  enrutador.post("/mesas/:tokenQr/pedir", (req, res, next) => controlador.realizarPedido(req, res, next));
  enrutador.post("/mesas/:tokenQr/llamar", (req, res, next) => controlador.terminar_llamado(req, res, next));

  return enrutador;
}
