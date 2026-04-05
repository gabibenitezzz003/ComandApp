import { Router } from "express";
import { ControladorAutenticacion } from "../controladores/controlador-autenticacion";

export function crearRutasAutenticacion(controlador: ControladorAutenticacion): Router {
  const enrutador = Router();

  enrutador.post("/login", (req, res, next) => controlador.login(req, res, next));
  enrutador.post("/registro", (req, res, next) => controlador.registro(req, res, next));

  return enrutador;
}
