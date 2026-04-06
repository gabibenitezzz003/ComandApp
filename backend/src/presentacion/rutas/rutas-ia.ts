import { Router } from "express";
import { ControladorIa } from "../controladores/controlador-ia";

export function crearRutasIa(
  controlador: ControladorIa,
  middlewareAuth?: any // Hacemos opcional por ahora si ya está en index
): Router {
  const enrutador = Router();

  enrutador.post("/consultar", (req, res, next) => controlador.consultar(req, res, next));
  enrutador.post("/upsell", (req, res, next) => controlador.sugerirUpsell(req, res, next));

  return enrutador;
}
