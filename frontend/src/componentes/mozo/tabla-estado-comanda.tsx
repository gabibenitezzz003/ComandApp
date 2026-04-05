"use client";

import { useState } from "react";
import { Comanda, EstadoComanda } from "../../tipos/tipos-comanda";
import { clienteApi } from "../../servicios/cliente-api";

interface PropiedadesTabla {
  comandas: Comanda[];
  alActualizarEstado: (comandaId: string, nuevoEstado: EstadoComanda) => void;
}

const SIGUIENTE_ESTADO: Partial<Record<EstadoComanda, EstadoComanda>> = {
  RECIBIDO:          "EN_PREPARACION",
  EN_PREPARACION:    "LISTO_PARA_SERVIR",
  LISTO_PARA_SERVIR: "ENTREGADO",
  ENTREGADO:         "PAGADO",
};

const BADGE_CLASS: Record<EstadoComanda, string> = {
  RECIBIDO:           "saas-badge badge-recibido",
  EN_PREPARACION:     "saas-badge badge-preparacion",
  LISTO_PARA_SERVIR:  "saas-badge badge-listo",
  ENTREGADO:          "saas-badge badge-entregado",
  PAGADO:             "saas-badge badge-pagado",
  INCIDENCIA:         "saas-badge badge-incidencia",
};

const LABEL_ESTADO: Record<EstadoComanda, string> = {
  RECIBIDO:           "Recibido",
  EN_PREPARACION:     "En Prep",
  LISTO_PARA_SERVIR:  "Listo",
  ENTREGADO:          "Entregado",
  PAGADO:             "Pagado",
  INCIDENCIA:         "Incidencia",
};

const LABEL_ACCION: Partial<Record<EstadoComanda, string>> = {
  RECIBIDO:          "Preparar",
  EN_PREPARACION:    "Terminar",
  LISTO_PARA_SERVIR: "Entregar",
  ENTREGADO:         "Cobrar",
};

function calcularTiempo(fechaStr: string): string {
  const diff = Date.now() - new Date(fechaStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Ahora";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function TablaEstadoComanda({ comandas, alActualizarEstado }: PropiedadesTabla) {
  const [actualizando, setActualizando] = useState<string | null>(null);

  const cambiarEstado = async (comanda: Comanda, nuevoEstado: EstadoComanda) => {
    setActualizando(comanda.id);
    try {
      await clienteApi.patch(`/comandas/${comanda.id}/estado`, { estado: nuevoEstado });
      alActualizarEstado(comanda.id, nuevoEstado);
    } catch {
      // Error silencioso
    } finally {
      setActualizando(null);
    }
  };

  const marcarIncidencia = async (comanda: Comanda) => {
    if (comanda.estado === "PAGADO") return;
    await cambiarEstado(comanda, "INCIDENCIA");
  };

  return (
    <table className="saas-table">
      <thead>
        <tr>
          <th>Mesa</th>
          <th>Estado</th>
          <th>Items</th>
          <th>Total</th>
          <th>Tiempo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {comandas.map((comanda) => {
          const siguienteEstado = SIGUIENTE_ESTADO[comanda.estado];
          const enProgreso = actualizando === comanda.id;

          return (
            <tr key={comanda.id}>
              {/* Mesa */}
              <td className="font-medium text-text-primary">
                #{comanda.mesaId?.slice(-2) ?? "?"}
                <div className="text-xs text-text-muted mt-0.5 font-normal">
                  ID: {comanda.id.slice(0, 6)}
                </div>
              </td>

              {/* Estado */}
              <td>
                <span className={BADGE_CLASS[comanda.estado]}>
                  {LABEL_ESTADO[comanda.estado]}
                </span>
              </td>

              {/* Items */}
              <td>
                <div className="flex flex-col gap-1">
                  {comanda.items?.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center text-sm">
                      <span className="text-text-muted w-4 mr-1">{item.cantidad}x</span>
                      <span className="text-text-secondary truncate max-w-[120px]">{item.nombreItem || "Item"}</span>
                    </div>
                  ))}
                  {(comanda.items?.length ?? 0) > 2 && (
                    <span className="text-xs text-text-muted">
                      +{(comanda.items?.length ?? 0) - 2} más
                    </span>
                  )}
                </div>
              </td>

              {/* Total */}
              <td className="text-text-primary tracking-tight">
                ${comanda.total.toLocaleString("es-AR")}
              </td>

              {/* Tiempo */}
              <td className="text-text-muted">
                {calcularTiempo(comanda.creadoEn)}
              </td>

              {/* Acciones */}
              <td>
                <div className="flex items-center gap-2">
                  {siguienteEstado && (
                    <button
                      className="saas-btn-primary"
                      style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
                      onClick={() => cambiarEstado(comanda, siguienteEstado)}
                      disabled={enProgreso}
                    >
                      {enProgreso ? "..." : LABEL_ACCION[comanda.estado]}
                    </button>
                  )}
                  {comanda.estado !== "PAGADO" && comanda.estado !== "INCIDENCIA" && (
                    <button
                      className="text-text-muted hover:text-red-400 transition-colors p-1"
                      onClick={() => marcarIncidencia(comanda)}
                      disabled={enProgreso}
                      title="Marcar incidencia"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
