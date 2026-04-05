"use client";

import { useState, useEffect } from "react";
import { Comanda, Mesa } from "../../tipos/tipos-comanda";
import { clienteApi } from "../../servicios/cliente-api";
import { toast } from "sonner";
import { reproducirDing } from "../../comunes/audio";

interface UsuarioMozo {
  id: string;
  nombre: string;
}

interface SimuladorMesasProps {
  comandas: Comanda[];
}

export function SimuladorMesas({ comandas }: SimuladorMesasProps) {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [mozos, setMozos] = useState<UsuarioMozo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const resMesas = await clienteApi.get<Mesa[]>("/mesas");
      setMesas(resMesas);

      const resMozos = await clienteApi.get<UsuarioMozo[]>("/usuarios/mozos");
      setMozos(resMozos);
    } catch (e: any) {
      setError(e.message || "Error al cargar el simulador.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    
    // Escuchar eventos en tiempo real para el efecto "Magia" (Luces/Push)
    const socket = (window as any).socket; // Accedemos al socket global si existe o usamos el hook indirectamente
    if (socket) {
        const manejarNueva = (comanda: Comanda) => {
            reproducirDing();
            toast.info(`¡Nuevo Pedido! Mesa ${comanda.mesaId.slice(0,2)}`, {
                description: `Total: $${comanda.total}`,
                position: "bottom-left"
            });
            cargarDatos(); // Refresh tables
        };
        socket.on("comanda:nueva", manejarNueva);
        return () => socket.off("comanda:nueva", manejarNueva);
    }
  }, []);

  const asignarMozo = async (mesaId: string, mozoId: string) => {
    try {
      await clienteApi.put<Mesa>(`/mesas/${mesaId}`, {
        mozoAsignadoId: mozoId === "unassigned" ? null : mozoId,
      });
      
      setMesas((prev) =>
        prev.map((m) =>
          m.id === mesaId ? { ...m, mozoAsignado: mozoId === "unassigned" ? null : mozos.find(x => x.id === mozoId) ?? null } : m
        )
      );
      
      if(mesaSeleccionada && mesaSeleccionada.id === mesaId) {
          setMesaSeleccionada(prev => prev ? { ...prev, mozoAsignado: mozoId === "unassigned" ? null : mozos.find(x => x.id === mozoId) ?? null } : prev);
      }
    } catch (e: any) {
      alert("Error al asignar el mozo: " + e.message);
    }
  };

  if (cargando) return <div className="p-12 text-center text-text-muted text-sm">Iniciando simulador de salón...</div>;
  if (error) return <div className="p-12 text-center text-red-500 text-sm">Error: {error}</div>;

  // Calculamos estado dinámico para cada mesa
  const mesasConEstado = mesas.map(mesa => {
    const comandasMesa = comandas.filter((c) => c.mesaId === mesa.id);
    const activas = comandasMesa.filter(c => c.estado !== "PAGADO");
    
    const tieneRojas = activas.some((c) => ["RECIBIDO", "EN_PREPARACION", "LISTO_PARA_SERVIR", "INCIDENCIA"].includes(c.estado));
    const tieneVerdes = activas.some((c) => c.estado === "ENTREGADO");
    
    let tipo: "LIBRE" | "VERDE" | "ROJA" = "LIBRE";
    if (tieneRojas) tipo = "ROJA";
    else if (tieneVerdes) tipo = "VERDE";

    const totalVenta = activas.reduce((acc, c) => acc + Number(c.total), 0);

    return { ...mesa, tipo, totalVenta, comandasActivas: activas };
  });

  const mesasLibres = mesasConEstado.filter(m => m.tipo === "LIBRE");
  const mesasOcupadas = mesasConEstado.filter(m => m.tipo !== "LIBRE");
  
  // Encontrar la logica de la mesa seleccionada actualizada
  const seleccionadaFix = mesaSeleccionada ? mesasConEstado.find(m => m.id === mesaSeleccionada.id) : null;

  return (
    <div className="flex bg-[#050505] min-h-[600px] border border-[var(--border-subtle)] rounded-lg overflow-hidden relative">
      {/* Patrón de Rejilla de Fondo (Encanto Visual) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none z-0"></div>
      
      {/* Grid Principal (Izquierda) */}
      <div className="flex-1 p-8 overflow-y-auto relative z-10 custom-scrollbar">
        
        {/* Sección: Ocupadas / Con Pedidos */}
        <div className="mb-8 relative z-10">
            <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Action Required ({mesasOcupadas.length})
            </h3>
            <div className="flex flex-wrap gap-4">
                {mesasOcupadas.map((mesa) => (
                    <button 
                        key={mesa.id}
                        onClick={() => setMesaSeleccionada(mesa)}
                        className={`w-40 p-4 rounded-xl border flex flex-col text-left transition-all duration-300 relative overflow-hidden group ${
                            seleccionadaFix?.id === mesa.id ? 'ring-2 ring-white' : 'hover:scale-[1.02]'
                        } ${
                            mesa.tipo === "ROJA" 
                                ? 'bg-[#1a0505] border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                                : 'bg-[#021810] border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)]'
                        }`}
                    >
                         {/* Luz superior interna para dar más brillo glassmórfico */}
                         <div className={`absolute top-0 left-0 right-0 h-1/2 opacity-20 bg-gradient-to-b to-transparent ${mesa.tipo === "ROJA" ? "from-red-500" : "from-emerald-500"}`}></div>

                         <div className="flex justify-between items-center w-full mb-3 relative z-10">
                             <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded flex items-center justify-center font-black text-white text-lg drop-shadow-md ${mesa.tipo === "ROJA" ? "bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.8)]"}`}>
                                    {mesa.numero}
                                </div>
                             </div>
                             <div className={`w-2 h-2 rounded-full ${mesa.tipo === "ROJA" ? "bg-red-400 animate-pulse" : "bg-emerald-400"}`}></div>
                         </div>
                         <div className="text-xs font-medium text-white/50 mb-1 truncate relative z-10">
                             Resp: {mesa.mozoAsignado?.nombre || "N/A"}
                         </div>
                         <div className={`text-lg font-black relative z-10 drop-shadow-md ${mesa.tipo === "ROJA" ? "text-red-400" : "text-emerald-400"}`}>
                             ${mesa.totalVenta.toLocaleString("es-AR")}
                         </div>
                    </button>
                ))}
                {mesasOcupadas.length === 0 && <span className="text-text-muted text-sm italic">Sala de operaciones despejada.</span>}
            </div>
        </div>

        {/* Sección: Disponibles */}
        <div className="relative z-10">
            <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">Standby ({mesasLibres.length})</h3>
            <div className="flex flex-wrap gap-3">
                {mesasLibres.map((mesa) => (
                    <button 
                        key={mesa.id}
                        onClick={() => setMesaSeleccionada(mesa)}
                        className={`w-36 p-3 rounded-xl border transition-all flex items-center justify-between ${
                            seleccionadaFix?.id === mesa.id 
                                ? 'bg-[#1a1a1a] border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                                : 'bg-[#0a0a0a] border-[var(--border-subtle)] hover:bg-[#141414] hover:border-text-muted hover:shadow-lg'
                        }`}
                    >   
                         <div className="flex items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-colors ${seleccionadaFix?.id === mesa.id ? "text-white" : "text-text-muted"}`}>
                                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="2" y1="10" x2="22" y2="10"></line>
                            </svg>
                            <span className={`text-sm font-semibold transition-colors ${seleccionadaFix?.id === mesa.id ? "text-white" : "text-text-secondary"}`}>Mesa {mesa.numero}</span>
                         </div>
                    </button>
                ))}
            </div>
        </div>

      </div>

      {/* Sidebar Detalles (Derecha) */}
      {seleccionadaFix && (
        <div className="w-80 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col anim-slide-in-right shrink-0">
          <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[#1f1f1f]">
             <h2 className="text-lg font-bold text-white">Detalle Mesa {seleccionadaFix.numero}</h2>
             <button onClick={() => setMesaSeleccionada(null)} className="text-text-muted hover:text-white p-1">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
             
             {/* Info de la Mesa */}
             <div className="space-y-4">
                 <div>
                    <label className="text-xs text-text-muted uppercase mb-1 block tracking-wider">Mozo Asignado</label>
                    <select
                        className="w-full bg-[#141414] border border-[var(--border-subtle)] text-text-primary text-sm rounded-md px-3 py-2 outline-none focus:border-text-secondary"
                        value={seleccionadaFix.mozoAsignado?.id || "unassigned"}
                        onChange={(e) => asignarMozo(seleccionadaFix.id, e.target.value)}
                    >
                        <option value="unassigned">— Sin asignar —</option>
                        {mozos.map((mozo) => (
                        <option key={mozo.id} value={mozo.id}>
                            {mozo.nombre}
                        </option>
                        ))}
                    </select>
                 </div>
                 
                 <div className="flex items-center gap-2 text-sm text-text-secondary bg-[#141414] border border-[var(--border-subtle)] rounded-md p-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    <span className="truncate">QR: {seleccionadaFix.tokenQr.slice(0,8)}...</span>
                 </div>
             </div>

             {/* Comandas Activas */}
             {seleccionadaFix.comandasActivas.length > 0 ? (
                 <div className="space-y-3">
                     <h4 className="text-sm font-semibold text-text-primary border-b border-[var(--border-subtle)] pb-2">
                        Pedidos Activos
                     </h4>
                     {seleccionadaFix.comandasActivas.map(c => (
                         <div key={c.id} className="bg-[#141414] p-3 rounded-md border border-[var(--border-subtle)]">
                             <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${["RECIBIDO","EN_PREPARACION","LISTO_PARA_SERVIR"].includes(c.estado) ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
                                    {c.estado}
                                </span>
                                <span className="text-xs font-bold">${Number(c.total).toLocaleString()}</span>
                             </div>
                             <div className="text-xs space-y-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                                 {c.items?.map(item => (
                                    <div key={item.id} className="flex flex-col">
                                        <div className="flex justify-between items-center text-text-secondary">
                                            <span className="font-medium text-white/80">{item.cantidad}x {item.nombreItem}</span>
                                            <span className="tabular-nums">${Number(item.subtotal || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="text-[10px] text-text-muted">
                                            ${Number(item.precioUnitario || 0).toLocaleString()} c/u
                                        </div>
                                    </div>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="text-center py-6 text-text-muted text-sm">
                     La mesa está vacía, no hay comandas vivas.
                 </div>
             )}

          </div>

          {/* Footer Total */}
          {seleccionadaFix.totalVenta > 0 && (
              <div className="p-4 border-t border-[var(--border-subtle)] bg-[#1f1f1f]">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary font-medium">Total Consumo:</span>
                    <span className="text-xl font-bold text-emerald-400">${seleccionadaFix.totalVenta.toLocaleString()}</span>
                  </div>
              </div>
          )}
        </div>
      )}

    </div>
  );
}
