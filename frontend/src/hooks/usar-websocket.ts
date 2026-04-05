"use client";

import { useEffect } from "react";
import { Comanda } from "../tipos/tipos-comanda";
import { obtenerSocket, conectarSocket, desconectarSocket } from "../servicios/websocket";
import { usarEstadoComandas } from "../estados/estado-comandas";
import { usarEstadoAutenticacion } from "../estados/estado-autenticacion";
import { toast } from "sonner";
import { reproducirDing } from "../comunes/audio";

export function usarWebSocket(): void {
  const { actualizarComanda, agregarComanda } = usarEstadoComandas();
  const { usuario } = usarEstadoAutenticacion();

  useEffect(() => {
    conectarSocket();
    const socket = obtenerSocket();

    socket.on("comanda:actualizada", (comanda: Comanda) => {
      actualizarComanda(comanda);
      // Admin and Mozo get different feedback
      if (usuario?.rol === "MOZO" && (comanda.estado === "LISTO_PARA_SERVIR" || comanda.estado === "INCIDENCIA")) {
          reproducirDing();
          toast.success(`La Mesa ${comanda.mesaNumero || ""} requiere atención ⚡`, {
              description: `Estado: ${comanda.estado}`,
              duration: 5000,
          });
      }
      if (usuario?.rol === "ADMIN") {
          toast.info(`Mesa ${comanda.mesaNumero || ""} ha cambiado a ${comanda.estado}`);
      }
    });

    socket.on("comanda:nueva", (comanda: Comanda) => {
      agregarComanda(comanda);
      reproducirDing();
      const msj = `¡Nuevo Pedido - Mesa ${comanda.mesaNumero || ""}! ✨`;
      if (usuario?.rol === "MOZO") {
          toast.info(msj, { description: "Revisar comandas", duration: 5000 });
      } else if (usuario?.rol === "ADMIN") {
          toast.success(msj, { description: `Consumo: $${comanda.total}`, duration: 5000 });
      }
    });

    return () => {
      socket.off("comanda:actualizada");
      socket.off("comanda:nueva");
      desconectarSocket();
    };
  }, [actualizarComanda, agregarComanda]);
}
