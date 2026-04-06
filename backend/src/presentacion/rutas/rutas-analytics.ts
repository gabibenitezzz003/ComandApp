import { Router } from "express";
import { ControladorAnalytics } from "../controladores/controlador-analytics";

export function crearRutasAnalytics(
  controlador: ControladorAnalytics,
  middlewareAuth: any,
  middlewareRolAdmin: any
): Router {
  const router = Router();
  router.use(middlewareAuth, middlewareRolAdmin);

  router.get("/", (req, res, next) =>
    controlador.obtener(req, res).catch(next)
  );

  return router;
}
