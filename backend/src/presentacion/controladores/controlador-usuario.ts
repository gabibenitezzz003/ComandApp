import { Request, Response, NextFunction } from "express";
import { ListarMozos } from "../../aplicacion/casos-uso/listar-mozos";

export class ControladorUsuario {
  constructor(private readonly listarMozos: ListarMozos) {}

  async obtenerMozos(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.listarMozos.ejecutar();
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
