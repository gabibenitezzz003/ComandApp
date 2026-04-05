import { Request, Response, NextFunction } from "express";
import { ConsultarIa } from "../../aplicacion/casos-uso/consultar-ia";
import { esquemaConsultaIa } from "../../aplicacion/validadores/validador-ia";

export class ControladorIa {
  constructor(private readonly consultarIa: ConsultarIa) {}

  async consultar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaConsultaIa.parse(req.body);
      const resultado = await this.consultarIa.ejecutar(datos);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
