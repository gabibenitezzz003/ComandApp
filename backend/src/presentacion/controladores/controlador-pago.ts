import { Request, Response, NextFunction } from "express";
import { ProcesarPago } from "../../aplicacion/casos-uso/procesar-pago";
import { esquemaCrearPago } from "../../aplicacion/validadores/validador-pago";

export class ControladorPago {
  constructor(private readonly procesarPago: ProcesarPago) {}

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaCrearPago.parse(req.body);
      const resultado = await this.procesarPago.ejecutar(datos);
      res.status(201).json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
