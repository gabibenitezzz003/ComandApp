"use client";

import { useState } from "react";
import { ItemMenu } from "../../tipos/tipos-comanda";
import { usarEstadoCarrito } from "../../estados/estado-carrito";

interface PropiedadesTarjetaItemMenu {
  item: ItemMenu;
}

export function TarjetaItemMenu({ item }: PropiedadesTarjetaItemMenu) {
  const { agregarItem } = usarEstadoCarrito();
  const [agregado, setAgregado] = useState(false);

  const manejarAgregar = () => {
    agregarItem(item);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <div
      className="glass glass-hover p-4 flex items-start gap-4"
      style={{ cursor: "default" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className="font-semibold text-sm leading-tight"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
          >
            {item.nombre}
          </h4>
          <span
            className="text-base font-black flex-shrink-0"
            style={{ color: "var(--accent-emerald)", fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
          >
            ${item.precio.toLocaleString("es-AR")}
          </span>
        </div>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {item.descripcion}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {item.tiempoPreparacion} min
          </span>
        </div>
      </div>

      <button
        onClick={manejarAgregar}
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: agregado
            ? "rgba(52,211,153,0.15)"
            : "rgba(79,142,247,0.12)",
          border: agregado
            ? "1px solid rgba(52,211,153,0.3)"
            : "1px solid rgba(79,142,247,0.2)",
          color: agregado ? "var(--accent-emerald)" : "var(--accent-blue)",
          transform: agregado ? "scale(1.1)" : "scale(1)",
        }}
      >
        {agregado ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>
    </div>
  );
}
