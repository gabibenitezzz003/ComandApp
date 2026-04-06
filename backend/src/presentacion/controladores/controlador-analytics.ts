import { Request, Response } from "express";
import { ObtenerAnalytics } from "../../aplicacion/casos-uso/obtener-analytics";

export class ControladorAnalytics {
  constructor(private readonly obtenerAnalytics: ObtenerAnalytics) {}

  async obtener(req: Request, res: Response): Promise<void> {
    const { periodo = "dia" } = req.query;

    const hasta = new Date();
    const desde = new Date();

    switch (periodo) {
      case "semana":
        desde.setDate(hasta.getDate() - 7);
        break;
      case "mes":
        desde.setMonth(hasta.getMonth() - 1);
        break;
      case "anio":
        desde.setFullYear(hasta.getFullYear() - 1);
        break;
      default: // dia
        desde.setHours(0, 0, 0, 0);
        break;
    }

    const datos = await this.obtenerAnalytics.obtener(desde, hasta);
    res.json({ exito: true, datos });
  }
}
