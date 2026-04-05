"use client";

import { useEffect } from "react";
import { usarEstadoAutenticacion } from "../../../estados/estado-autenticacion";
import { usarEstadoComandas } from "../../../estados/estado-comandas";
import { usarWebSocket } from "../../../hooks/usar-websocket";
import { unirseAlTablero } from "../../../servicios/websocket";
import { GraficosAdmin } from "../../../componentes/admin/graficos-admin";
import { SimuladorMesas } from "../../../componentes/admin/simulador-mesas";
import { FormularioLogin } from "../../../componentes/compartidos/formulario-login";
import { EstadoComanda } from "../../../tipos/tipos-comanda";

export default function PaginaDashboard() {
  const { usuario, cargarDesdeStorage, cerrarSesion } = usarEstadoAutenticacion();
  const { comandas, cargando, cargarTodas, actualizarComanda } = usarEstadoComandas();

  usarWebSocket();

  useEffect(() => {
    cargarDesdeStorage();
  }, [cargarDesdeStorage]);

  useEffect(() => {
    if (usuario) {
      unirseAlTablero();
      cargarTodas();
    }
  }, [usuario, cargarTodas]);

  if (!usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 relative overflow-hidden bg-[var(--bg-main)]">
        <div className="bg-grid-subtle" />
        <div className="relative z-10 w-full flex justify-center">
          <FormularioLogin titulo="Acceso Administración" />
        </div>
      </div>
    );
  }

  // We will let simuladormesas handle its own assignment logic if needed.
  // We don't necessarily need de table anymore here since we have the simulador.

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col anim-fade-in-bottom">
      
      {/* SaaS Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="font-bold tracking-tight text-text-primary border-r border-[var(--border-subtle)] pr-4">
            ComandApp
          </div>
          <span className="text-text-secondary text-sm font-medium">Dashboard Admin</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-text-primary text-sm font-medium leading-tight">{usuario.nombre}</span>
            <span className="text-text-muted text-xs uppercase tracking-widest">{usuario.rol}</span>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-text-muted hover:text-red-400 text-sm font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 space-y-10">
        
        {/* Graphics Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-semibold text-text-primary tracking-tight">Análisis en tiempo real</h2>
             <span className="text-xs font-medium text-text-muted uppercase tracking-wider px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
               Live
             </span>
          </div>
          <GraficosAdmin comandas={comandas} />
        </section>

        {/* Simulador de Mesas (Plano del Local) */}
        <section>
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-xl font-semibold text-text-primary tracking-tight">Plano Interactivo del Local</h2>
             <span className="text-sm text-text-secondary font-medium">Asignación de Mozos en vivo</span>
          </div>
          <SimuladorMesas comandas={comandas} />
        </section>

      </main>
    </div>
  );
}
