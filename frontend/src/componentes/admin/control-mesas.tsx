"use client";

import { useState, useEffect, useCallback } from "react";
import { Comanda, Mesa } from "../../tipos/tipos-comanda";
import { clienteApi } from "../../servicios/cliente-api";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────
type EstadoMesa = "libre" | "ocupada" | "alerta";

interface MesaUI {
  numero: number;
  estado: EstadoMesa;
  comandaActiva: Comanda | null;
  mozoNombre: string | null;
  mesaId: string | null;
}

interface Props {
  comandas: Comanda[];
}

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────
const TOTAL_MESAS = 50;

function buildMesasUI(mesas: Mesa[], comandas: Comanda[]): MesaUI[] {
  return Array.from({ length: TOTAL_MESAS }, (_, i) => {
    const numero = i + 1;
    const mesa = mesas.find((m) => m.numero === numero);
    if (!mesa) {
      return { numero, estado: "libre" as EstadoMesa, comandaActiva: null, mozoNombre: null, mesaId: null };
    }
    const comandasActivas = comandas.filter(
      (c) => c.mesaId === mesa.id && c.estado !== "PAGADO"
    );
    const tieneAlerta = comandasActivas.some(
      (c) => c.estado === "RECIBIDO" || c.estado === "INCIDENCIA"
    );
    const estado: EstadoMesa = comandasActivas.length > 0
      ? (tieneAlerta ? "alerta" : "ocupada")
      : "libre";

    return {
      numero,
      estado,
      comandaActiva: comandasActivas[0] ?? null,
      mozoNombre: mesa.mozoAsignado?.nombre ?? null,
      mesaId: mesa.id,
    };
  });
}

// ────────────────────────────────────────────────────────────────
// Sub-component: Mesa Card
// ────────────────────────────────────────────────────────────────
function TarjetaMesa({
  mesa,
  seleccionada,
  onClick,
}: {
  mesa: MesaUI;
  seleccionada: boolean;
  onClick: () => void;
}) {
  const colores = {
    libre:  { bg: "rgba(30,34,54,0.85)", border: "#374151", glow: "none", label: "#6b7280" },
    ocupada:{ bg: "rgba(6,78,59,0.5)",   border: "#10b981", glow: "0 0 14px #10b981aa", label: "#34d399" },
    alerta: { bg: "rgba(69,10,10,0.6)",  border: "#ef4444", glow: "0 0 22px #ef4444cc", label: "#f87171" },
  };
  const c = colores[mesa.estado];

  return (
    <button
      onClick={onClick}
      title={`Mesa ${mesa.numero}${mesa.mozoNombre ? ` — ${mesa.mozoNombre}` : ""}`}
      style={{
        background: c.bg,
        border: `1.5px solid ${seleccionada ? "#a78bfa" : c.border}`,
        boxShadow: seleccionada ? "0 0 20px #a78bfa99" : c.glow,
        borderRadius: "12px",
        padding: "10px 6px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        position: "relative",
        overflow: "hidden",
        animationName: mesa.estado === "alerta" ? "pulso" : "none",
        animationDuration: "1.4s",
        animationTimingFunction: "ease-in-out",
        animationIterationCount: "infinite",
      }}
    >
      {/* Número de mesa */}
      <span style={{ fontSize: "13px", fontWeight: 700, color: c.label, lineHeight: 1 }}>
        {mesa.numero}
      </span>

      {/* Ícono de estado */}
      <span style={{ fontSize: "18px", lineHeight: 1 }}>
        {mesa.estado === "libre"   ? "🪑" :
         mesa.estado === "alerta"  ? "🔴" : "🟢"}
      </span>

      {/* Badge de items pendientes */}
      {mesa.comandaActiva && mesa.estado === "alerta" && (
        <span style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          background: "#ef4444",
          color: "#fff",
          borderRadius: "99px",
          fontSize: "9px",
          fontWeight: 800,
          padding: "1px 5px",
          lineHeight: 1.4,
        }}>
          {mesa.comandaActiva.items?.length ?? "!"}
        </span>
      )}

      {/* Mozo asignado */}
      {mesa.mozoNombre && (
        <span style={{ fontSize: "8px", color: "#9ca3af", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "100%", padding: "0 4px" }}>
          {mesa.mozoNombre.split(" ")[0]}
        </span>
      )}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// Sub-component: Sidebar de detalle
// ────────────────────────────────────────────────────────────────
function SidebarDetalle({ mesa, onClose }: { mesa: MesaUI; onClose: () => void }) {
  const comanda = mesa.comandaActiva;
  const estadoColor: Record<string, string> = {
    RECIBIDO:           "#fde047",
    EN_PREPARACION:     "#fb923c",
    LISTO_PARA_SERVIR:  "#4ade80",
    ENTREGADO:          "#60a5fa",
    INCIDENCIA:         "#f87171",
    PAGADO:             "#34d399",
  };

  return (
    <aside style={{
      width: "320px",
      flexShrink: 0,
      background: "rgba(17,24,39,0.95)",
      border: "1px solid #374151",
      borderRadius: "16px",
      padding: "20px",
      backdropFilter: "blur(12px)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ color: "#f9fafb", fontWeight: 700, fontSize: "16px", margin: 0 }}>
          Mesa {mesa.numero}
        </h3>
        <button onClick={onClose} style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
      </div>

      {/* Estado */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>Estado:</span>
        <span style={{
          fontSize: "12px",
          fontWeight: 600,
          color: mesa.estado === "alerta" ? "#f87171" : mesa.estado === "ocupada" ? "#34d399" : "#6b7280",
          textTransform: "capitalize",
        }}>
          {mesa.estado === "alerta" ? "⚡ Pedido activo" : mesa.estado === "ocupada" ? "✅ En servicio" : "🪑 Libre"}
        </span>
      </div>

      {/* Mozo */}
      {mesa.mozoNombre && (
        <div style={{ fontSize: "13px", color: "#d1d5db" }}>
          🤵 <strong>Mozo:</strong> {mesa.mozoNombre}
        </div>
      )}

      {/* Comanda */}
      {comanda ? (
        <>
          <div style={{ borderTop: "1px solid #1f2937", paddingTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", color: "#9ca3af" }}>Comanda activa</span>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                background: `${estadoColor[comanda.estado]}22`,
                color: estadoColor[comanda.estado],
                border: `1px solid ${estadoColor[comanda.estado]}55`,
                borderRadius: "99px",
                padding: "2px 10px",
              }}>
                {comanda.estado.replace(/_/g, " ")}
              </span>
            </div>

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {comanda.items?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "13px", color: "#f3f4f6", fontWeight: 500 }}>
                      {item.cantidad}× {item.nombreItem}
                    </span>
                    {item.notas && (
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>📝 {item.notas}</div>
                    )}
                  </div>
                  <span style={{ fontSize: "13px", color: "#a78bfa", fontWeight: 600, whiteSpace: "nowrap", marginLeft: "8px" }}>
                    ${item.subtotal?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{ borderTop: "1px solid #1f2937", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "14px", color: "#d1d5db", fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: "18px", color: "#a78bfa", fontWeight: 800 }}>
              ${Number(comanda.total).toFixed(2)}
            </span>
          </div>
        </>
      ) : (
        <div style={{ color: "#4b5563", fontSize: "13px", textAlign: "center", paddingTop: "20px" }}>
          Sin comandas activas
        </div>
      )}
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────
export function ControlMesas({ comandas }: Props) {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  const cargarMesas = useCallback(async () => {
    try {
      const data = await clienteApi.get<Mesa[]>("/mesas");
      setMesas(data);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { cargarMesas(); }, [cargarMesas]);

  const mesasUI = buildMesasUI(mesas, comandas);
  const mesaSeleccionada = seleccionada !== null
    ? mesasUI.find((m) => m.numero === seleccionada) ?? null
    : null;

  // Stats rápidas
  const libres  = mesasUI.filter((m) => m.estado === "libre").length;
  const alertas = mesasUI.filter((m) => m.estado === "alerta").length;
  const ocupadas= mesasUI.filter((m) => m.estado === "ocupada").length;

  return (
    <>
      {/* CSS de animación pulse */}
      <style>{`
        @keyframes pulso {
          0%, 100% { box-shadow: 0 0 22px #ef4444cc; }
          50%       { box-shadow: 0 0 40px #ef4444ff, 0 0 60px #ef444466; }
        }
      `}</style>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Panel principal */}
        <div style={{ flex: 1 }}>
          {/* Stats rápidas */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            {[
              { label: "Libres",   value: libres,   color: "#6b7280", bg: "#1f2937" },
              { label: "En servicio", value: ocupadas, color: "#10b981", bg: "rgba(6,78,59,0.35)" },
              { label: "⚡ Con alerta", value: alertas, color: "#ef4444", bg: "rgba(69,10,10,0.5)" },
            ].map((s) => (
              <div key={s.label} style={{
                background: s.bg,
                border: `1px solid ${s.color}44`,
                borderRadius: "10px",
                padding: "10px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}>
                <span style={{ fontSize: "22px", fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Grid de mesas */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
            gap: "10px",
            background: "rgba(10,13,28,0.6)",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #1f2937",
          }}>
            {mesasUI.map((mesa) => (
              <TarjetaMesa
                key={mesa.numero}
                mesa={mesa}
                seleccionada={seleccionada === mesa.numero}
                onClick={() => setSeleccionada(seleccionada === mesa.numero ? null : mesa.numero)}
              />
            ))}
          </div>

          {/* Leyenda */}
          <div style={{ display: "flex", gap: "20px", marginTop: "14px", flexWrap: "wrap" }}>
            {[
              { color: "#6b7280", label: "Libre" },
              { color: "#10b981", label: "En servicio" },
              { color: "#ef4444", label: "⚡ Alerta (titila)" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color }} />
                <span style={{ fontSize: "12px", color: "#6b7280" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar de detalle */}
        {mesaSeleccionada && (
          <SidebarDetalle
            mesa={mesaSeleccionada}
            onClose={() => setSeleccionada(null)}
          />
        )}
      </div>
    </>
  );
}
