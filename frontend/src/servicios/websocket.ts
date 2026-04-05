import { io, Socket } from "socket.io-client";

const URL_WEBSOCKET = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

let instanciaSocket: Socket | null = null;

export function obtenerSocket(): Socket {
  if (!instanciaSocket) {
    instanciaSocket = io(URL_WEBSOCKET, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return instanciaSocket;
}

export function conectarSocket(): void {
  const socket = obtenerSocket();
  if (!socket.connected) {
    socket.connect();
  }
}

export function desconectarSocket(): void {
  if (instanciaSocket?.connected) {
    instanciaSocket.disconnect();
  }
}

export function unirseAMesa(mesaId: string): void {
  obtenerSocket().emit("unirse:mesa", mesaId);
}

export function unirseComoMozo(mozoId: string): void {
  obtenerSocket().emit("unirse:mozo", mozoId);
}

export function unirseAlTablero(): void {
  obtenerSocket().emit("unirse:tablero");
}
