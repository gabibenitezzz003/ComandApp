import { Request, Response, NextFunction } from "express";
import { ObtenerMenu } from "../../aplicacion/casos-uso/obtener-menu";
import { CategoriaMenu } from "../../dominio/entidades/item-menu";
import { RepositorioItemMenu } from "../../dominio/interfaces-repositorios/repositorio-item-menu";
import { esquemaCrearItemMenu, esquemaActualizarItemMenu } from "../../aplicacion/validadores/validador-item-menu";

export class ControladorMenu {
  constructor(
    private readonly obtenerMenu: ObtenerMenu,
    private readonly repositorioItemMenu: RepositorioItemMenu
  ) {}

  async listarDisponibles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await this.obtenerMenu.ejecutarTodos();
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async listarPorCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoria = req.params.categoria as CategoriaMenu;
      const resultado = await this.obtenerMenu.ejecutarPorCategoria(categoria);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCrearItemMenu.parse(req.body);
      const resultado = await this.repositorioItemMenu.crear({
        ...datos,
        disponible: true,
      });
      res.status(201).json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaActualizarItemMenu.parse(req.body);
      const resultado = await this.repositorioItemMenu.actualizar(String(req.params.id), datos);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.repositorioItemMenu.eliminar(String(req.params.id));
      res.json({ exito: true, datos: null });
    } catch (error) {
      next(error);
    }
  }
}
