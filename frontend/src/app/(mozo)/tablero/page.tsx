"use client";

import { useEffect } from "react";
import { usarEstadoAutenticacion } from "../../../estados/estado-autenticacion";
import { PanelMozo } from "../../../componentes/mozo/panel-mozo";
import { FormularioLogin } from "../../../componentes/compartidos/formulario-login";

export default function PaginaTablero() {
  const { usuario, cargarDesdeStorage } = usarEstadoAutenticacion();

  useEffect(() => {
    cargarDesdeStorage();
  }, [cargarDesdeStorage]);

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-[var(--bg-main)]">
        <div className="bg-grid-subtle" />
        <div className="relative z-10 w-full flex justify-center">
          <FormularioLogin titulo="Acceso Mozos" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]">
      {/* Sidebar - purely functional */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] anim-slide-in-right">
        <div className="px-6 py-6 border-b border-[var(--border-subtle)]">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            ComandApp
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1 py-6 px-4">
          <button className="flex items-center gap-3 px-3 py-2 rounded-md bg-[var(--border-subtle)] text-[var(--accent-primary)] text-sm font-medium">
            <span>⚡</span> Comandas activas
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--border-subtle)] transition-colors text-text-secondary hover:text-text-primary text-sm font-medium">
            <span>📋</span> Historial
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--border-subtle)] transition-colors text-text-secondary hover:text-text-primary text-sm font-medium">
            <span>🍽️</span> Menú
          </button>
        </nav>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-text-muted font-medium mb-1 tracking-wide">SESIÓN</div>
          <div className="text-sm font-medium text-text-primary">{usuario.nombre}</div>
          <div className="text-xs text-text-secondary capitalize">{usuario.rol.toLowerCase()}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-[var(--bg-main)]">
        <PanelMozo />
      </main>
    </div>
  );
}
