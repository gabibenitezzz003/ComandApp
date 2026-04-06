import { Router } from "express";
import { ControladorIa } from "../controladores/controlador-ia";

export function crearRutasIa(
  controlador: ControladorIa
): Router {
  const enrutador = Router();

  enrutador.post("/consultar", (req, res, next) => controlador.consultar(req, res, next));
  enrutador.post("/upsell", (req, res, next) => controlador.sugerirUpsell(req, res, next));

  return enrutador;
}
