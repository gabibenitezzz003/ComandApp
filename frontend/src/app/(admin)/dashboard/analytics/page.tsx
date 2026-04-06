"use client";

import { useEffect } from "react";
import { usarEstadoAutenticacion } from "../../../../estados/estado-autenticacion";
import { FormularioLogin } from "../../../../componentes/compartidos/formulario-login";
import { PanelAnalytics } from "../../../../componentes/admin/panel-analytics";
import Link from "next/link";

export default function PaginaAnalytics() {
  const { usuario, cargarDesdeStorage, cerrarSesion } = usarEstadoAutenticacion();

  useEffect(() => { cargarDesdeStorage(); }, [cargarDesdeStorage]);

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-[var(--bg-main)]">
        <FormularioLogin titulo="Acceso Administración" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-tight text-text-primary border-r border-[var(--border-subtle)] pr-4">ComandApp</span>
          {/* Nav Tabs */}
          <nav className="flex items-center gap-1">
            {[
              { href: "/dashboard",           label: "Inicio" },
              { href: "/dashboard/mesas",     label: "Control Mesas" },
              { href: "/dashboard/cocina",    label: "Cocina" },
              { href: "/dashboard/analytics", label: "Analytics", active: true },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: item.active ? 700 : 500,
                color: item.active ? "#a78bfa" : "#6b7280",
                background: item.active ? "rgba(167,139,250,0.1)" : "transparent",
                border: item.active ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
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
            <span className="text-text-muted text-xs uppercase tracking-widest">{usuario.rol}</span>
          </div>
          <button onClick={cerrarSesion} className="text-text-muted hover:text-red-400 text-sm font-medium transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full p-6 lg:p-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Analytics & Reportes</h1>
            <p className="text-text-muted text-sm mt-1">Desempeño del negocio — Día / Semana / Mes / Año</p>
          </div>
        </div>

        <PanelAnalytics />
      </main>
    </div>
  );
}
