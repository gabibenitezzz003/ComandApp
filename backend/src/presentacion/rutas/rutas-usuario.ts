import { Router } from "express";
import { ControladorUsuario } from "../controladores/controlador-usuario";

export function crearRutasUsuario(
  controlador: ControladorUsuario,
  middlewareAuth: any,
  middlewareRolAdmin: any
): Router {
  const enrutador = Router();

  // Protect this route, admin only might be good, or any authenticated user can see mozos?
  // Let's protect it with auth and Admin role to be safe, since they assign them from Dashboard.
  enrutador.get("/mozos", middlewareAuth, middlewareRolAdmin, controlador.obtenerMozos.bind(controlador));

  return enrutador;
}
