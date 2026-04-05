import { Request, Response, NextFunction } from "express";
import { GestionarMesas } from "../../aplicacion/casos-uso/gestionar-mesas";
import { esquemaCrearMesa, esquemaActualizarMesa } from "../../aplicacion/validadores/validador-mesa";

export class ControladorMesa {
  constructor(private readonly gestionarMesas: GestionarMesas) {}

  async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.gestionarMesas.obtenerTodas();
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.gestionarMesas.obtenerPorToken(String(req.params.tokenQr));
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCrearMesa.parse(req.body);
      const resultado = await this.gestionarMesas.crear(datos);
      res.status(201).json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaActualizarMesa.parse(req.body);
      const resultado = await this.gestionarMesas.actualizar(String(req.params.id), datos);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
