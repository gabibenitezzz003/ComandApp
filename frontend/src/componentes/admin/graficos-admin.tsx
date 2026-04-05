"use client";

import { Comanda, EstadoComanda, ETIQUETAS_ESTADO } from "../../tipos/tipos-comanda";

interface PropiedadesGraficosAdmin {
  comandas: Comanda[];
}

export function GraficosAdmin({ comandas }: PropiedadesGraficosAdmin) {
  const contadorPorEstado = comandas.reduce<Record<string, number>>(
    (acc, c) => { acc[c.estado] = (acc[c.estado] ?? 0) + 1; return acc; },
    {}
  );

  const totalVentas = comandas
    .filter((c) => c.estado === "PAGADO")
    .reduce((t, c) => t + c.total, 0);

  const promedioTicket =
    comandas.length > 0
      ? comandas.reduce((t, c) => t + c.total, 0) / comandas.length
      : 0;

  const estados: EstadoComanda[] = [
    "RECIBIDO", "EN_PREPARACION", "LISTO_PARA_SERVIR",
    "ENTREGADO", "INCIDENCIA", "PAGADO",
  ];

  const maximo = Math.max(...Object.values(contadorPorEstado), 1);

  return (
    <div className="space-y-6">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className="saas-card p-6">
          <div className="text-sm font-medium text-text-secondary mb-2">Comandas Totales</div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-text-primary">
              {comandas.length}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="saas-card p-6">
          <div className="text-sm font-medium text-text-secondary mb-2">Ventas Proyectadas</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-medium text-text-muted">$</span>
            <span className="text-4xl font-bold tracking-tight text-text-primary">
              {totalVentas.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="saas-card p-6">
          <div className="text-sm font-medium text-text-secondary mb-2">Ticket Promedio</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-medium text-text-muted">$</span>
            <span className="text-4xl font-bold tracking-tight text-text-primary">
              {promedioTicket.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="saas-card p-6">
        <div className="text-sm font-medium text-text-secondary border-b border-[var(--border-subtle)] pb-4 mb-4">
          Distribución de Estados
        </div>
        
        <div className="space-y-4 pt-2">
          {estados.map((estado) => {
            const cantidad = contadorPorEstado[estado] ?? 0;
            const porcentaje = (cantidad / maximo) * 100;
            
            // Map colors to simple clean saas hex values
            let barColor = "#ededed"; // Default primary
            if (estado === "RECIBIDO") barColor = "#3b82f6";
            if (estado === "EN_PREPARACION") barColor = "#f59e0b";
            if (estado === "LISTO_PARA_SERVIR" || estado === "PAGADO") barColor = "#10b981";
            if (estado === "ENTREGADO") barColor = "#8b5cf6";
            if (estado === "INCIDENCIA") barColor = "#ef4444";

            return (
              <div key={estado} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-text-secondary truncate">
                  {ETIQUETAS_ESTADO[estado]}
                </div>
                <div className="flex-1 relative flex items-center h-8">
                  {/* Background Track */}
                  <div className="absolute inset-0 bg-[#1f1f1f] rounded-sm" />
                  
                  {/* Animated Bar */}
                  <div 
                    className="absolute top-0 left-0 h-full rounded-sm transition-all duration-1000 ease-in-out"
                    style={{ 
                      width: `${Math.max(porcentaje, cantidad > 0 ? 1 : 0)}%`,
                      backgroundColor: barColor 
                    }}
                  />
                </div>
                <div className="w-8 text-right font-medium text-sm text-text-primary">
                  {cantidad}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
