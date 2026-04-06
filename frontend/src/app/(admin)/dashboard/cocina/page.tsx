"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usarEstadoAutenticacion } from "../../../../estados/estado-autenticacion";
import { usarEstadoComandas } from "../../../../estados/estado-comandas";
import { usarWebSocket } from "../../../../hooks/usar-websocket";
import { unirseAlTablero } from "../../../../servicios/websocket";
import { FormularioLogin } from "../../../../componentes/compartidos/formulario-login";
import { KdsPanel } from "../../../../componentes/admin/kds-panel";

export default function PaginaCocina() {
  const { usuario, cargarDesdeStorage, cerrarSesion } = usarEstadoAutenticacion();
  const { comandas, cargarTodas, actualizarComanda } = usarEstadoComandas();

  usarWebSocket();

  useEffect(() => { cargarDesdeStorage(); }, [cargarDesdeStorage]);

  useEffect(() => {
    if (usuario) {
      unirseAlTablero();
      cargarTodas();
    }
  }, [usuario, cargarTodas]);

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--bg-main)]">
        <FormularioLogin titulo="Acceso Administración / Cocina" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-tight text-text-primary border-r border-[var(--border-subtle)] pr-4">ComandApp</span>
          {/* Nav Tabs */}
          <nav className="flex items-center gap-1">
            {[
              { href: "/dashboard",           label: "Inicio" },
              { href: "/dashboard/mesas",     label: "Control Mesas" },
              { href: "/dashboard/cocina",    label: "Cocina", active: true },
              { href: "/dashboard/analytics", label: "Analytics" },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: item.active ? 700 : 500,
                color: item.active ? "#3b82f6" : "#6b7280", // Azul para destacarlo de Mánager
                background: item.active ? "rgba(59,130,246,0.1)" : "transparent",
                border: item.active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s",
              }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-text-primary text-sm font-medium">{usuario.nombre}</span>
            <span className="text-text-muted text-xs uppercase tracking-widest">KITCHEN DISPLAY (KDS)</span>
          </div>
          <button onClick={cerrarSesion} className="text-text-muted hover:text-red-400 text-sm font-medium transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main KDS Canvas */}
      <main className="flex-1 w-full p-4 lg:p-6 flex flex-col max-h-[calc(100vh-73px)]">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">KDS: Despacho Principal</h1>
          </div>
          {/* Live indicator */}
          <span className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            SINC EXTREMA
          </span>
        </div>

        <div className="flex-1 overflow-hidden">
            <KdsPanel comandas={comandas} actualizarComanda={async (id, estado) => {
              try {
                await import("../../../../servicios/cliente-api").then(m => m.clienteApi.put(`/comandas/${id}/estado`, { estado }));
              } catch (e) {
                console.error("Error al avanzar comanda", e);
              }
            }} />
        </div>
      </main>
    </div>
  );
}
