"use client";

import { useEffect, useState } from "react";
import { Comanda, EstadoComanda } from "../../tipos/tipos-comanda";

// ────────────────────────────────────────────────────────────────
// Helper: Tiempo Transcurrido
// ────────────────────────────────────────────────────────────────
function TiempoTranscurrido({ desde, activo }: { desde: string; activo: boolean }) {
  const [minutos, setMinutos] = useState(0);

  useEffect(() => {
    if (!activo) return;
    const calc = () => {
      const diff = Date.now() - new Date(desde).getTime();
      setMinutos(Math.floor(diff / 60000));
    };
    calc();
    const interval = setInterval(calc, 30000); // 30s
    return () => clearInterval(interval);
  }, [desde, activo]);

  const esAlerta = minutos >= 15;
  const esGrave = minutos >= 25;

  let color = "#10b981"; // verde < 15
  if (esAlerta && !esGrave) color = "#fbbf24"; // amarillo >= 15
  if (esGrave) color = "#ef4444"; // rojo >= 25

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "12px",
      fontWeight: 700,
      color,
      background: `${color}22`,
      padding: "4px 8px",
      borderRadius: "6px",
      border: `1px solid ${color}55`,
      animation: esGrave ? "pulserojo 1s infinite" : "none",
    }}>
      <span style={{ fontSize: "14px" }}>⏱️</span>
      {minutos} min
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Componente de Tarjeta (Ticket)
// ────────────────────────────────────────────────────────────────
function TarjetaTicket({
  comanda,
  onAvanzar,
}: {
  comanda: Comanda;
  onAvanzar: (id: string, nuevoEstado: EstadoComanda) => void;
}) {
  const esRecibido = comanda.estado === "RECIBIDO";
  const esPrep = comanda.estado === "EN_PREPARACION";
  const esListo = comanda.estado === "LISTO_PARA_SERVIR";

  return (
    <div style={{
      background: "#1e2236",
      border: "1px solid #374151",
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
      transition: "transform 0.2s",
      minWidth: "260px",
    }}>
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#f9fafb", margin: 0, lineHeight: 1.2 }}>
            Mesa {comanda.mesaNumero || "?"}
          </h3>
          <span style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase" }}>
            {comanda.mozoNombre ? `Mozo: ${comanda.mozoNombre}` : "Sin mozo"}
          </span>
        </div>
        <TiempoTranscurrido desde={comanda.actualizadoEn} activo={!esListo} />
      </div>

      {/* Observaciones Generales */}
      {comanda.observaciones && (
        <div style={{ background: "rgba(245,158,11,0.1)", borderLeft: "3px solid #f59e0b", padding: "6px 10px", fontSize: "12px", color: "#fcd34d", fontStyle: "italic", borderRadius: "0 4px 4px 0" }}>
          ⚠️ {comanda.observaciones}
        </div>
      )}

      {/* Lista de Items */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", background: "rgba(10,13,28,0.4)", borderRadius: "8px", padding: "12px" }}>
        {comanda.items?.map((item: any, i: number) => (
          <div key={item.id || i} style={{ borderBottom: i === (comanda.items?.length || 1) - 1 ? "none" : "1px dashed #374151", paddingBottom: i === (comanda.items?.length || 1) - 1 ? 0 : "8px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#a78bfa", width: "24px" }}>
                {item.cantidad}x
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#f3f4f6" }}>
                  {item.nombreItem}
                </div>
                {item.notas && (
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
                    👉 {item.notas}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de Acción */}
      <div style={{ marginTop: "auto", paddingTop: "8px" }}>
        {esRecibido && (
          <button
            onClick={() => onAvanzar(comanda.id, "EN_PREPARACION")}
            style={{ width: "100%", padding: "12px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.4)" }}
          >
            👨‍🍳 EMPEZAR A PREPARAR
          </button>
        )}
        {esPrep && (
          <button
            onClick={() => onAvanzar(comanda.id, "LISTO_PARA_SERVIR")}
            style={{ width: "100%", padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.4)" }}
          >
            🔔 MARCAR COMO LISTO
          </button>
        )}
        {esListo && (
          <div style={{ textAlign: "center", color: "#34d399", fontSize: "12px", fontWeight: 700, padding: "10px", background: "rgba(16,185,129,0.1)", borderRadius: "8px", border: "1px dashed #10b981" }}>
            ESPERANDO AL MOZO...
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Columna (Swimlane)
// ────────────────────────────────────────────────────────────────
function Columna({ titulo, color, comandas, onAvanzar, emptyMsg }: { titulo: string, color: string, comandas: Comanda[], onAvanzar: (id: string, e: EstadoComanda) => void, emptyMsg: string }) {
  return (
    <div style={{
      flex: 1,
      minWidth: "320px",
      display: "flex",
      flexDirection: "column",
      background: "rgba(17,24,39,0.6)",
      borderRadius: "16px",
      border: `1px solid ${color}33`,
      overflow: "hidden"
    }}>
      <div style={{ background: `${color}15`, borderBottom: `1px solid ${color}33`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: color, margin: 0, fontSize: "16px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>{titulo}</h2>
        <span style={{ background: color, color: "#111827", padding: "2px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 800 }}>
          {comandas.length}
        </span>
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", flex: 1, height: "calc(100vh - 220px)" }}>
        {comandas.length === 0 ? (
          <div style={{ textAlign: "center", color: "#6b7280", marginTop: "40px", fontSize: "14px" }}>
            {emptyMsg}
          </div>
        ) : (
          comandas.map(c => <TarjetaTicket key={c.id} comanda={c} onAvanzar={onAvanzar} />)
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────
interface Props {
  comandas: Comanda[];
  actualizarComanda: (id: string, estado: EstadoComanda) => Promise<void>;
}

export function KdsPanel({ comandas, actualizarComanda }: Props) {
  // Filtrar solo las comandas relevantes para cocina
  const recibos = comandas.filter(c => c.estado === "RECIBIDO").sort((a,b) => new Date(a.actualizadoEn).getTime() - new Date(b.actualizadoEn).getTime());
  const prep = comandas.filter(c => c.estado === "EN_PREPARACION").sort((a,b) => new Date(a.actualizadoEn).getTime() - new Date(b.actualizadoEn).getTime());
  const listos = comandas.filter(c => c.estado === "LISTO_PARA_SERVIR").sort((a,b) => new Date(b.actualizadoEn).getTime() - new Date(a.actualizadoEn).getTime()); // últimos listos arriba

  return (
    <>
      <style>{`
        @keyframes pulserojo {
          0%, 100% { box-shadow: 0 0 10px #ef444466; border-color: #ef4444; }
          50% { box-shadow: 0 0 25px #ef4444; border-color: #f87171; }
        }
        /* Custom scrollbar for columns */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
      
      <div style={{ display: "flex", gap: "20px", height: "100%", overflowX: "auto", paddingBottom: "10px" }}>
        <Columna
          titulo="Recibidos"
          color="#3b82f6" // Azul
          comandas={recibos}
          onAvanzar={actualizarComanda}
          emptyMsg="No hay pedidos nuevos."
        />
        <Columna
          titulo="En Preparación"
          color="#f59e0b" // Naranja
          comandas={prep}
          onAvanzar={actualizarComanda}
          emptyMsg="La cocina está libre."
        />
        <Columna
          titulo="Listos (A retirar)"
          color="#10b981" // Verde
          comandas={listos}
          onAvanzar={actualizarComanda}
          emptyMsg="No hay pedidos esperando mozo."
        />
      </div>
    </>
  );
}
