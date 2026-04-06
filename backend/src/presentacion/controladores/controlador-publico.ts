import { Request, Response, NextFunction } from "express";
import { RepositorioMesa } from "../../dominio/interfaces-repositorios/repositorio-mesa";
import { CrearComanda } from "../../aplicacion/casos-uso/crear-comanda";
import { ServicioWebSocket } from "../../aplicacion/interfaces-infraestructura/servicio-websocket";
import { esquemaCrearComanda } from "../../aplicacion/validadores/validador-comanda";

export class ControladorPublico {
  constructor(
    private readonly repositorioMesa: RepositorioMesa,
    private readonly crearComanda: CrearComanda,
    private readonly servicioWebSocket: ServicioWebSocket
  ) {}

  async obtenerInfoMesa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenQr = String(req.params.tokenQr);
      const mesa = await this.repositorioMesa.obtenerPorToken(tokenQr);

      if (!mesa) {
        res.status(404).json({ exito: false, error: { mensaje: "Mesa no encontrada o código QR inválido" } });
        return;
      }

      res.json({
        exito: true,
        datos: {
          id: mesa.id,
          numero: mesa.numero,
          activa: mesa.activa,
          tieneMozo: !!mesa.mozoAsignado?.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async realizarPedido(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenQr = String(req.params.tokenQr);
      const mesa = await this.repositorioMesa.obtenerPorToken(tokenQr);

      if (!mesa) {
        res.status(404).json({ exito: false, error: { mensaje: "Código QR inválido" } });
        return;
      }

      if (!mesa.activa) {
        res.status(400).json({ exito: false, error: { mensaje: "La mesa no está activa. Consulte al mozo." } });
        return;
      }

      // Si no tiene mozo asignado, asignamos a un "Admin" genérico o lanzamos un error.
      // Lo ideal es dejarla vinculada a la mesa y el mozo la toma.
      const mozoId = mesa.mozoAsignado?.id || "11111111-1111-1111-1111-111111111111"; // Fallback: admin user si la mesa está huérfana


      // Validar datos de entrada (observaciiones e items)
      const datosEntrada = {
        mesaId: mesa.id,
        mozoId: mozoId,
        observaciones: req.body.observaciones || "PEDIDO DESDE MENÚ QR 📱",
        items: req.body.items, // Array de { itemMenuId, cantidad, notas }
      };

      const validado = esquemaCrearComanda.parse(datosEntrada);
      const resultado = await this.crearComanda.ejecutar(validado);

      // El Websocket hacia KDS y Mozos ya lo emite el caso de uso `crearComanda.ejecutar`
      
      res.status(201).json({ exito: true, datos: resultado });
    } catch (error) {
      next(error);
    }
  }

  terminar_llamado(req: Request, res: Response, next: NextFunction): void {
      try {
        const tokenQr = String(req.params.tokenQr);
        const { tipo } = req.body; // "mozo" | "cuenta"
        
        // Simplemente emitimos un evento WS a la sala del restaurante para que las pantallas titilen
        this.servicioWebSocket.emitirAMesa(tokenQr, "LLAMADO_CLIENTE", { tipo, tokenQr });
        
        res.json({ exito: true, mensaje: "Llamado emitido exitosamente" });
      } catch (error) {
        next(error);
      }
  }
}
