import { Server as ServidorHttp } from "http";
import { Server, Socket } from "socket.io";
import { ServicioWebSocket } from "../../aplicacion/interfaces-infraestructura/servicio-websocket";
import { Comanda } from "../../dominio/entidades/comanda";

export class ServidorWebSocketImpl implements ServicioWebSocket {
  private io: Server;

  constructor(servidorHttp: ServidorHttp, origenCors: string | string[]) {
    this.io = new Server(servidorHttp, {
      cors: {
        origin: origenCors,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      allowUpgrades: true,
      pingTimeout: 30000,
      pingInterval: 25000,
    });

    this.configurarConexiones();
  }

  emitirActualizacionComanda(comanda: Comanda): void {
    this.io.to(`mesa:${comanda.mesaId}`).emit("comanda:actualizada", comanda);
    this.io.to(`mozo:${comanda.mozoId}`).emit("comanda:actualizada", comanda);
    this.io.to("tablero").emit("comanda:actualizada", comanda);
  }

  emitirNuevaComanda(comanda: Comanda): void {
    this.io.to(`mesa:${comanda.mesaId}`).emit("comanda:nueva", comanda);
    this.io.to(`mozo:${comanda.mozoId}`).emit("comanda:nueva", comanda);
    this.io.to("tablero").emit("comanda:nueva", comanda);
  }

  emitirPagoRegistrado(comandaId: string): void {
    this.io.to("tablero").emit("pago:registrado", { comandaId });
  }

  emitirAMesa(mesaId: string, evento: string, datos: unknown): void {
    this.io.to(`mesa:${mesaId}`).emit(evento, datos);
  }

  emitirAMozo(mozoId: string, evento: string, datos: unknown): void {
    this.io.to(`mozo:${mozoId}`).emit(evento, datos);
  }

  obtenerInstanciaIo(): Server {
    return this.io;
  }

  private configurarConexiones(): void {
    this.io.on("connection", (socket: Socket) => {
      this.manejarUnionSalas(socket);
      this.manejarDesconexion(socket);
    });
  }

  private manejarUnionSalas(socket: Socket): void {
    socket.on("unirse:mesa", (mesaId: string) => {
      socket.join(`mesa:${mesaId}`);
    });

    socket.on("unirse:mozo", (mozoId: string) => {
      socket.join(`mozo:${mozoId}`);
    });

    socket.on("unirse:tablero", () => {
      socket.join("tablero");
    });
  }

  private manejarDesconexion(_socket: Socket): void {
    _socket.on("disconnect", () => {});
  }
}
