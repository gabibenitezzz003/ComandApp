"use client";

import { useState, useEffect, useCallback } from "react";
import { clienteApi } from "../../servicios/cliente-api";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────
type Periodo = "dia" | "semana" | "mes" | "anio";

interface AnalyticsData {
  resumen: {
    totalFacturado: number;
    totalComandas: number;
    ticketPromedio: number;
    mesaMasRentable: { numero: number; total: number } | null;
  };
  ingresosPorHora: { hora: number; total: number }[];
  topPlatos: { nombre: string; cantidad: number; total: number }[];
  performanceMozos: { nombre: string; comandas: number; total: number }[];
  comandasPorEstado: { estado: string; cantidad: number }[];
}

// ────────────────────────────────────────────────────────────────
// Helper: SVG Bar Chart
// ────────────────────────────────────────────────────────────────
function GraficoLinea({ datos }: { datos: { hora: number; total: number }[] }) {
  const w = 600, h = 140, pad = 32;
  const valores = datos.map((d) => d.total);
  const maxVal = Math.max(...valores, 1);
  const puntos = datos.map((d, i) => {
    const x = pad + (i / (datos.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - (d.total / maxVal) * (h - pad * 2);
    return `${x},${y}`;
  });
  const polyline = puntos.join(" ");
  const area = `${pad},${h - pad} ${polyline} ${w - pad},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Area */}
      <polygon points={area} fill="url(#areaGrad)" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Points & Labels */}
      {datos.map((d, i) => {
        const x = pad + (i / (datos.length - 1 || 1)) * (w - pad * 2);
        const y = h - pad - (d.total / maxVal) * (h - pad * 2);
        return (
          <g key={i}>
            {d.total > 0 && <circle cx={x} cy={y} r="4" fill="#a78bfa" stroke="#1e1b4b" strokeWidth="2" />}
            {/* Hora label cada 2 */}
            {i % 2 === 0 && (
              <text x={x} y={h - 8} textAnchor="middle" fontSize="9" fill="#4b5563">{d.hora}h</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────
// Helper: KPI Card
// ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: string; color: string }) {
  return (
    <div style={{
      background: "rgba(17,24,39,0.8)",
      border: "1px solid #1f2937",
      borderRadius: "14px",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      flex: 1,
      minWidth: "160px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <span style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
      </div>
      <span style={{ fontSize: "26px", fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
      {sub && <span style={{ fontSize: "11px", color: "#4b5563" }}>{sub}</span>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main: Panel Analytics
// ────────────────────────────────────────────────────────────────
export function PanelAnalytics() {
  const [periodo, setPeriodo] = useState<Periodo>("dia");
  const [datos, setDatos] = useState<AnalyticsData | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await clienteApi.get<AnalyticsData>(`/analytics?periodo=${periodo}`);
      setDatos(res);
    } catch {
      setDatos(null);
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => { cargar(); }, [cargar]);

  const periodos: { key: Periodo; label: string }[] = [
    { key: "dia",    label: "Hoy" },
    { key: "semana", label: "Semana" },
    { key: "mes",    label: "Mes" },
    { key: "anio",   label: "Año" },
  ];

  const COLORES_ESTADO: Record<string, string> = {
    RECIBIDO:           "#fde047",
    EN_PREPARACION:     "#fb923c",
    LISTO_PARA_SERVIR:  "#4ade80",
    ENTREGADO:          "#60a5fa",
    INCIDENCIA:         "#f87171",
    PAGADO:             "#34d399",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Period Selector */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {periodos.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            style={{
              padding: "8px 20px",
              borderRadius: "99px",
              border: `1.5px solid ${periodo === p.key ? "#a78bfa" : "#374151"}`,
              background: periodo === p.key ? "rgba(167,139,250,0.15)" : "transparent",
              color: periodo === p.key ? "#a78bfa" : "#6b7280",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={cargar}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            borderRadius: "99px",
            border: "1px solid #374151",
            background: "transparent",
            color: "#6b7280",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {cargando ? "⟳ Cargando..." : "↺ Actualizar"}
        </button>
      </div>

      {cargando && !datos && (
        <div style={{ textAlign: "center", padding: "60px", color: "#4b5563" }}>Cargando datos...</div>
      )}

      {datos && (
        <>
          {/* KPIs */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <KpiCard
              icon="💰" label="Facturado" color="#a78bfa"
              value={`$${datos.resumen.totalFacturado.toFixed(2)}`}
            />
            <KpiCard
              icon="📋" label="Comandas" color="#34d399"
              value={String(datos.resumen.totalComandas)}
            />
            <KpiCard
              icon="🎯" label="Ticket Promedio" color="#fbbf24"
              value={`$${datos.resumen.ticketPromedio.toFixed(2)}`}
            />
            {datos.resumen.mesaMasRentable && (
              <KpiCard
                icon="🏆" label="Mesa Estrella" color="#f97316"
                value={`Mesa ${datos.resumen.mesaMasRentable.numero}`}
                sub={`$${datos.resumen.mesaMasRentable.total.toFixed(2)} generados`}
              />
            )}
          </div>

          {/* Row: Gráfico de ingresos + Comandas por estado */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {/* Ingresos por hora */}
            <div style={{
              flex: 2,
              minWidth: "280px",
              background: "rgba(17,24,39,0.8)",
              border: "1px solid #1f2937",
              borderRadius: "14px",
              padding: "20px",
            }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "14px", color: "#d1d5db", fontWeight: 600 }}>
                📈 Ingresos por hora
              </h4>
              <GraficoLinea datos={datos.ingresosPorHora} />
            </div>

            {/* Comandas por estado (barras simples) */}
            <div style={{
              flex: 1,
              minWidth: "220px",
              background: "rgba(17,24,39,0.8)",
              border: "1px solid #1f2937",
              borderRadius: "14px",
              padding: "20px",
            }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "14px", color: "#d1d5db", fontWeight: 600 }}>
                🔢 Por Estado
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {datos.comandasPorEstado.map((e) => {
                  const color = COLORES_ESTADO[e.estado] ?? "#6b7280";
                  const maxCant = Math.max(...datos.comandasPorEstado.map((x) => x.cantidad), 1);
                  return (
                    <div key={e.estado}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#9ca3af" }}>{e.estado.replace(/_/g, " ")}</span>
                        <span style={{ fontSize: "11px", color, fontWeight: 700 }}>{e.cantidad}</span>
                      </div>
                      <div style={{ height: "6px", borderRadius: "99px", background: "#1f2937" }}>
                        <div style={{
                          height: "100%",
                          borderRadius: "99px",
                          background: color,
                          width: `${(e.cantidad / maxCant) * 100}%`,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row: Top platos + Performance mozos */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {/* Top Platos */}
            <div style={{
              flex: 1,
              minWidth: "260px",
              background: "rgba(17,24,39,0.8)",
              border: "1px solid #1f2937",
              borderRadius: "14px",
              padding: "20px",
            }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "14px", color: "#d1d5db", fontWeight: 600 }}>
                🍽️ Top Platos Más Vendidos
              </h4>
              {datos.topPlatos.length === 0 ? (
                <p style={{ color: "#4b5563", fontSize: "13px" }}>Sin datos en este período</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {datos.topPlatos.map((p, i) => {
                    const maxCant = Math.max(...datos.topPlatos.map((x) => x.cantidad), 1);
                    return (
                      <div key={p.nombre}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "13px", color: "#f3f4f6" }}>
                            <span style={{ color: "#6b7280", marginRight: "6px" }}>#{i + 1}</span>
                            {p.nombre}
                          </span>
                          <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 700 }}>
                            {p.cantidad} uds
                          </span>
                        </div>
                        <div style={{ height: "5px", borderRadius: "99px", background: "#1f2937" }}>
                          <div style={{
                            height: "100%",
                            borderRadius: "99px",
                            background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                            width: `${(p.cantidad / maxCant) * 100}%`,
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Performance Mozos */}
            <div style={{
              flex: 1,
              minWidth: "260px",
              background: "rgba(17,24,39,0.8)",
              border: "1px solid #1f2937",
              borderRadius: "14px",
              padding: "20px",
            }}>
              <h4 style={{ margin: "0 0 16px", fontSize: "14px", color: "#d1d5db", fontWeight: 600 }}>
                🤵 Performance Mozos
              </h4>
              {datos.performanceMozos.length === 0 ? (
                <p style={{ color: "#4b5563", fontSize: "13px" }}>Sin datos en este período</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Mozo", "Comandas", "Total"].map((h) => (
                        <th key={h} style={{ textAlign: "left", fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", paddingBottom: "8px", borderBottom: "1px solid #1f2937" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.performanceMozos.map((m, i) => (
                      <tr key={m.nombre} style={{ borderBottom: "1px solid #111827" }}>
                        <td style={{ padding: "10px 0", fontSize: "13px", color: i === 0 ? "#fbbf24" : "#f3f4f6" }}>
                          {i === 0 ? "🏅 " : ""}{m.nombre}
                        </td>
                        <td style={{ padding: "10px 0", fontSize: "13px", color: "#9ca3af" }}>{m.comandas}</td>
                        <td style={{ padding: "10px 0", fontSize: "13px", color: "#34d399", fontWeight: 700 }}>
                          ${m.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {!datos && !cargando && (
        <div style={{ textAlign: "center", padding: "60px", color: "#4b5563" }}>
          No hay datos para el período seleccionado
        </div>
      )}
    </div>
  );
}
