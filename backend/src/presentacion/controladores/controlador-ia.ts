import { Request, Response, NextFunction } from "express";
import { ConsultarIa } from "../../aplicacion/casos-uso/consultar-ia";
import { SugerirUpsell } from "../../aplicacion/casos-uso/sugerir-upsell";
import { esquemaConsultaIa } from "../../aplicacion/validadores/validador-ia";

export class ControladorIa {
  constructor(
    private readonly consultarIa: ConsultarIa,
    private readonly sugerirUpsellUc: SugerirUpsell
  ) {}

  async consultar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const datos = esquemaConsultaIa.parse(req.body);
      const resultado = await this.consultarIa.ejecutar(datos);
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  async sugerirUpsell(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.body.carrito || !Array.isArray(req.body.carrito)) {
        res.status(400).json({ exito: false, error: { mensaje: "El carrito debe ser un array de strings" } });
        return;
      }
      const resultado = await this.sugerirUpsellUc.ejecutar({ carrito: req.body.carrito });
      res.json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }
}
