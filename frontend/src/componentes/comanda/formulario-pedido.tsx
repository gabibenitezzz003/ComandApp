"use client";

import { useState } from "react";
import { usarEstadoCarrito } from "../../estados/estado-carrito";
import { clienteApi } from "../../servicios/cliente-api";
import { Comanda } from "../../tipos/tipos-comanda";

interface PropiedadesFormularioPedido {
  mesaId: string;
  mozoId: string;
  alEnviar: (comanda: Comanda) => void;
}

export function FormularioPedido({ mesaId, mozoId, alEnviar }: PropiedadesFormularioPedido) {
  const { items, observaciones, establecerObservaciones, actualizarCantidad, eliminarItem, vaciarCarrito, obtenerTotal } = usarEstadoCarrito();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sugerenciaIa, setSugerenciaIa] = useState<string | null>(null);
  const [cargandoIa, setCargandoIa] = useState(false);

  const pedirSugerenciaCopilot = async () => {
    if (items.length === 0) return;
    setCargandoIa(true);
    setSugerenciaIa(null);
    try {
      const nombresPlatos = items.map(i => i.itemMenu.nombre);
      const res = await clienteApi.post<{respuesta: string}>("/ia/upsell", { carrito: nombresPlatos });
      setSugerenciaIa(res.respuesta);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoIa(false);
    }
  };

  const manejarEnvio = async () => {
    if (items.length === 0) return;
    setEnviando(true);
    setError(null);
    try {
      const comanda = await clienteApi.post<Comanda>("/comandas", {
        mesaId,
        mozoId,
        observaciones: observaciones || null,
        items: items.map((item) => ({
          itemMenuId: item.itemMenu.id,
          cantidad: item.cantidad,
          notas: item.notas,
        })),
      });
      vaciarCarrito();
      alEnviar(comanda);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos enviar tu pedido. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-2xl"
          style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.15)" }}
        >
          🛒
        </div>
        <h3
          className="font-bold mb-1"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Tu carrito esta vacio
        </h3>
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Agrega items desde el menu para armar tu pedido
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h3
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Tu pedido
        </h3>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: "rgba(79,142,247,0.1)", color: "var(--accent-blue)" }}
        >
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.itemMenu.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {item.itemMenu.nombre}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                ${item.itemMenu.precio.toLocaleString("es-AR")} c/u
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}
                onClick={() => actualizarCantidad(item.itemMenu.id, item.cantidad - 1)}
              >
                -
              </button>
              <span
                className="w-7 text-center text-sm font-bold"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-heading)" }}
              >
                {item.cantidad}
              </span>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)" }}
                onClick={() => actualizarCantidad(item.itemMenu.id, item.cantidad + 1)}
              >
                +
              </button>
            </div>

            <span
              className="text-sm font-bold w-16 text-right"
              style={{ color: "var(--accent-emerald)", fontFamily: "var(--font-heading)" }}
            >
              ${(item.itemMenu.precio * item.cantidad).toLocaleString("es-AR")}
            </span>

            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: "rgba(239,68,68,0.08)", color: "#fc8181" }}
              onClick={() => eliminarItem(item.itemMenu.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Copilot IA Upselling Button */}
      {items.length > 0 && (
        <div style={{ marginTop: "16px", marginBottom: "16px" }}>
          {!sugerenciaIa && !cargandoIa && (
             <button
              onClick={pedirSugerenciaCopilot}
              style={{
                width: "100%", padding: "10px", borderRadius: "12px", background: "linear-gradient(90deg, #312e81, #4c1d95)",
                border: "1px solid #7c3aed", color: "#ddd6fe", fontSize: "13px", fontWeight: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", cursor: "pointer", transition: "all 0.2s"
              }}>
              ✨ SUGERENCIAS IA (Upselling)
            </button>
          )}

          {cargandoIa && (
            <div style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "rgba(124,58,237,0.1)", border: "1px dashed #7c3aed", color: "#a78bfa", fontSize: "13px", textAlign: "center", animation: "pulse 1.5s infinite" }}>
              Analizando carrito para upselling... ✨
            </div>
          )}

          {sugerenciaIa && !cargandoIa && (
            <div style={{ padding: "14px", borderRadius: "12px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)", position: "relative" }}>
              <button 
                onClick={() => setSugerenciaIa(null)} 
                style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", color: "#a78bfa", cursor: "pointer" }}>✕</button>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#c4b5fd", fontWeight: 800, marginBottom: "6px" }}>🤖 Copilot IA sugiere ofrecer:</div>
              <div style={{ fontSize: "13px", color: "#f5f3ff", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{sugerenciaIa}</div>
            </div>
          )}
        </div>
      )}

      <textarea
        className="input-premium text-sm"
        placeholder="Sin cebolla, extra limon..."
        value={observaciones}
        onChange={(e) => establecerObservaciones(e.target.value)}
        rows={2}
        style={{ resize: "none" }}
      />

      <hr className="glow-divider" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total del pedido</p>
          <p
            className="text-2xl font-black"
            style={{ fontFamily: "var(--font-heading)", color: "var(--accent-emerald)", lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            ${obtenerTotal().toLocaleString("es-AR")}
          </p>
        </div>
        <button
          className="btn-primary"
          style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem", opacity: enviando ? 0.7 : 1 }}
          onClick={manejarEnvio}
          disabled={enviando}
        >
          {enviando ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Enviando a cocina...
            </>
          ) : (
            <>
              Enviar pedido
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fc8181" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
