import { Request, Response, NextFunction } from "express";
import { CrearComanda } from "../../aplicacion/casos-uso/crear-comanda";
import { ActualizarEstado } from "../../aplicacion/casos-uso/actualizar-estado";
import { ObtenerComandas } from "../../aplicacion/casos-uso/obtener-comandas";
import { esquemaCrearComanda, esquemaActualizarEstado } from "../../aplicacion/validadores/validador-comanda";
import { EstadoComanda } from "../../dominio/entidades/comanda";

export class ControladorComanda {
  constructor(
    private readonly crearComanda: CrearComanda,
    private readonly actualizarEstado: ActualizarEstado,
    private readonly obtenerComandas: ObtenerComandas
  ) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCrearComanda.parse(req.body);
      const resultado = await this.crearComanda.ejecutar(datos);
      res.status(201).json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaActualizarEstado.parse({
        comandaId: req.params.id,
        nuevoEstado: req.body.estado,
      });
      const resultado = await this.actualizarEstado.ejecutar(datos);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async listarTodas(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.obtenerComandas.obtenerTodas();
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async listarActivas(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.obtenerComandas.obtenerActivas();
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async listarPorMesa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.obtenerComandas.obtenerPorMesa(String(req.params.mesaId));
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async listarPorMozo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.obtenerComandas.obtenerPorMozo(String(req.params.mozoId));
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async listarPorEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const estado = req.params.estado as EstadoComanda;
      const resultado = await this.obtenerComandas.obtenerPorEstado(estado);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
