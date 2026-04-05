import { Request, Response, NextFunction } from "express";
import { AutenticarUsuario } from "../../aplicacion/casos-uso/autenticar-usuario";
import { esquemaLogin, esquemaRegistro } from "../../aplicacion/validadores/validador-autenticacion";

export class ControladorAutenticacion {
  constructor(private readonly autenticarUsuario: AutenticarUsuario) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaLogin.parse(req.body);
      const resultado = await this.autenticarUsuario.login(datos);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async registro(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaRegistro.parse(req.body);
      const resultado = await this.autenticarUsuario.registro(datos);
      res.status(201).json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
