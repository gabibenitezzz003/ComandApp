"use client";

import { useState, useEffect } from "react";
import { usarEstadoComandas } from "../../estados/estado-comandas";
import { usarEstadoAutenticacion } from "../../estados/estado-autenticacion";
import { usarWebSocket } from "../../hooks/usar-websocket";
import { unirseComoMozo, unirseAlTablero } from "../../servicios/websocket";
import { TablaEstadoComanda } from "./tabla-estado-comanda";
import { EstadoComanda } from "../../tipos/tipos-comanda";

const FILTROS: { valor: EstadoComanda | "TODAS"; label: string }[] = [
  { valor: "TODAS",            label: "Todas" },
  { valor: "RECIBIDO",         label: "Recibido" },
  { valor: "EN_PREPARACION",   label: "En preparación" },
  { valor: "LISTO_PARA_SERVIR",label: "Listo para servir" },
  { valor: "ENTREGADO",        label: "Entregado" },
  { valor: "INCIDENCIA",       label: "Incidencia" },
];

export function PanelMozo() {
  const { usuario, cerrarSesion } = usarEstadoAutenticacion();
  const { comandas, cargando, cargarActivas, actualizarComanda } = usarEstadoComandas();
  const [filtroEstado, setFiltroEstado] = useState<EstadoComanda | "TODAS">("TODAS");

  usarWebSocket();

  useEffect(() => {
    if (usuario) {
      unirseComoMozo(usuario.id);
      unirseAlTablero();
      cargarActivas();
    }
  }, [usuario, cargarActivas]);

  const comandasFiltradas =
    filtroEstado === "TODAS"
      ? comandas
      : comandas.filter((c) => c.estado === filtroEstado);

  const manejarActualizacion = (comandaId: string, nuevoEstado: EstadoComanda) => {
    const comanda = comandas.find((c) => c.id === comandaId);
    if (comanda) actualizarComanda({ ...comanda, estado: nuevoEstado });
  };

  return (
    <div className="flex flex-col min-h-screen p-6 lg:p-10 max-w-6xl mx-auto anim-fade-in-bottom">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">En vivo</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Panel del Mozo</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-md">
            <span>Activas:</span>
            <span className="font-semibold text-text-primary">{comandas.length}</span>
          </div>
          <button
            onClick={cerrarSesion}
            className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4" style={{ scrollbarWidth: 'none' }}>
        {FILTROS.map((f) => {
          const isActive = filtroEstado === f.valor;
          return (
            <button
              key={f.valor}
              className={`whitespace-nowrap px-3 py-1.5 text-sm font-medium rounded-md transition-colors border ${
                isActive 
                  ? "bg-[var(--accent-primary)] text-[var(--accent-primary-fg)] border-[var(--accent-primary)]" 
                  : "bg-[var(--bg-surface)] text-text-secondary border-[var(--border-subtle)] hover:border-text-muted"
              }`}
              onClick={() => setFiltroEstado(f.valor)}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Main Table Area */}
      <div className="saas-card overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-text-muted text-sm">Cargando datos...</div>
        ) : comandasFiltradas.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-text-primary font-medium mb-1">Sin Comandas</h3>
            <p className="text-text-muted text-sm">No hay comandas que coincidan con este filtro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <TablaEstadoComanda
              comandas={comandasFiltradas}
              alActualizarEstado={manejarActualizacion}
            />
          </div>
        )}
      </div>

    </div>
  );
}
