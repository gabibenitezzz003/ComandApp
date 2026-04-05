"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ItemMenu, Mesa, Comanda, CategoriaMenu, ETIQUETAS_CATEGORIA, ETIQUETAS_ESTADO } from "../../../tipos/tipos-comanda";
import { clienteApi } from "../../../servicios/cliente-api";
import { conectarSocket, unirseAMesa } from "../../../servicios/websocket";
import { TarjetaItemMenu } from "../../../componentes/comanda/tarjeta-item-menu";
import { FormularioPedido } from "../../../componentes/comanda/formulario-pedido";
import { ChatIa } from "../../../componentes/comanda/chat-ia";
import { IndicadorEstado } from "../../../componentes/compartidos/indicador-estado";
import { usarWebSocket } from "../../../hooks/usar-websocket";
import { usarEstadoComandas } from "../../../estados/estado-comandas";
import { usarEstadoCarrito } from "../../../estados/estado-carrito";

const ICONOS_PESTANA: Record<string, JSX.Element> = {
  menu: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  pedido: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  asistente: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  estado: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
};

const COLORES_ESTADO_BORDE: Record<string, string> = {
  RECIBIDO: "rgba(253,224,71,0.4)",
  EN_PREPARACION: "rgba(251,146,60,0.4)",
  LISTO_PARA_SERVIR: "rgba(74,222,128,0.4)",
  ENTREGADO: "rgba(96,165,250,0.4)",
  INCIDENCIA: "rgba(248,113,113,0.4)",
  PAGADO: "rgba(52,211,153,0.4)",
};

const ICONOS_CATEGORIA: Record<CategoriaMenu, string> = {
  ENTRADA: "🥗",
  PLATO_PRINCIPAL: "🍖",
  POSTRE: "🍰",
  BEBIDA: "🍺",
  SNACK: "🍿",
};

function agruparPorCategoria(items: ItemMenu[]): Record<CategoriaMenu, ItemMenu[]> {
  const grupos: Partial<Record<CategoriaMenu, ItemMenu[]>> = {};
  for (const item of items) {
    if (!item.disponible) continue;
    if (!grupos[item.categoria]) grupos[item.categoria] = [];
    grupos[item.categoria]!.push(item);
  }
  return grupos as Record<CategoriaMenu, ItemMenu[]>;
}

function tiempoRelativo(fecha: string): string {
  const ahora = Date.now();
  const diff = ahora - new Date(fecha).getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1) return "Hace un momento";
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (horas === 1) return mins > 0 ? `Hace 1 hora ${mins} min` : "Hace 1 hora";
  return mins > 0 ? `Hace ${horas} hs ${mins} min` : `Hace ${horas} hs`;
}

export default function PaginaComensal() {
  const parametros = useParams();
  const tokenQr = parametros["token-qr"] as string;
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [menu, setMenu] = useState<ItemMenu[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [pestana, setPestana] = useState<"menu" | "pedido" | "asistente" | "estado">("menu");
  const { comandas, cargarPorMesa } = usarEstadoComandas();
  const cantidadCarrito = usarEstadoCarrito((s) => s.obtenerCantidadTotal());

  usarWebSocket();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datosMesa = await clienteApi.get<Mesa>(`/mesas/qr/${tokenQr}`);
        setMesa(datosMesa);

        conectarSocket();
        unirseAMesa(datosMesa.id);

        const datosMenu = await clienteApi.get<ItemMenu[]>("/menu");
        setMenu(datosMenu);

        await cargarPorMesa(datosMesa.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No pudimos cargar la mesa. Escanea el QR de nuevo.");
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [tokenQr, cargarPorMesa]);

  if (error) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-6"
        style={{ background: "var(--bg-deep)" }}
      >
        <div className="noise-overlay" />
        <div className="bg-orb-purple" style={{ top: "20%", left: "30%", width: "300px", height: "300px" }} />

        <div className="glass p-8 max-w-sm w-full text-center animate-fade-up">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl"
            style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            😵
          </div>
          <h2
            className="text-lg font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Algo salio mal
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            {error}
          </p>
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 4v6h6M23 20v-6h-6" />
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (cargando || !mesa) {
    return (
      <div
        className="flex min-h-screen items-center justify-center flex-col gap-4"
        style={{ background: "var(--bg-deep)" }}
      >
        <div className="noise-overlay" />
        <div className="bg-orb-blue" style={{ top: "30%", right: "20%", width: "250px", height: "250px" }} />

        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center animate-pulse"
            style={{
              background: "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(167,139,250,0.15))",
              border: "1px solid rgba(79,142,247,0.2)",
            }}
          >
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
        </div>
        <p
          className="text-sm animate-fade-up"
          style={{ color: "var(--text-muted)", animationDelay: "200ms" }}
        >
          Preparando tu mesa...
        </p>
      </div>
    );
  }

  const mozoIdPorDefecto = "00000000-0000-0000-0000-000000000001";
  const categorias = agruparPorCategoria(menu);

  const pestanas = [
    { id: "menu" as const, etiqueta: "Menu" },
    { id: "pedido" as const, etiqueta: "Pedido" },
    { id: "asistente" as const, etiqueta: "Asistente" },
    { id: "estado" as const, etiqueta: "Estado" },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-deep)" }}>
      <div className="noise-overlay" />
      <div className="bg-orb-blue" style={{ top: "-100px", right: "-50px", width: "300px", height: "300px", opacity: 0.4 }} />
      <div className="bg-orb-purple" style={{ bottom: "10%", left: "-80px", width: "250px", height: "250px", opacity: 0.3 }} />

      <header
        className="sticky top-0 z-20"
        style={{
          background: "rgba(5,8,18,0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
              style={{
                background: "linear-gradient(135deg, var(--accent-blue), var(--accent-purple))",
                color: "white",
                fontFamily: "var(--font-heading)",
                boxShadow: "0 4px 16px rgba(79,142,247,0.3)",
              }}
            >
              {mesa.numero}
            </div>
            <div>
              <h1
                className="text-base font-bold leading-tight"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
              >
                Mesa #{mesa.numero}
              </h1>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent-emerald)", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }}
                />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Conectado
                </span>
              </div>
            </div>
          </div>
          <div
            className="text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, rgba(79,142,247,0.1), rgba(167,139,250,0.1))",
              border: "1px solid rgba(79,142,247,0.15)",
              color: "var(--accent-blue)",
              fontFamily: "var(--font-heading)",
            }}
          >
            ComandApp
          </div>
        </div>
      </header>

      <nav
        className="sticky top-[61px] z-20 flex"
        style={{
          background: "rgba(5,8,18,0.8)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {pestanas.map((p) => (
          <button
            key={p.id}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all relative"
            style={{
              color: pestana === p.id ? "var(--accent-blue)" : "var(--text-muted)",
            }}
            onClick={() => setPestana(p.id)}
          >
            <div className="relative">
              {ICONOS_PESTANA[p.id]}
              {p.id === "pedido" && cantidadCarrito > 0 && (
                <span
                  className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--accent-blue), #6366f1)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(79,142,247,0.4)",
                  }}
                >
                  {cantidadCarrito}
                </span>
              )}
            </div>
            <span>{p.etiqueta}</span>
            {pestana === p.id && (
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                style={{
                  width: "24px",
                  background: "linear-gradient(90deg, var(--accent-blue), var(--accent-purple))",
                  boxShadow: "0 0 8px rgba(79,142,247,0.4)",
                }}
              />
            )}
          </button>
        ))}
      </nav>

      <main className="relative mx-auto max-w-lg px-4 pt-5">
        {pestana === "menu" && (
          <div className="space-y-8 animate-fade-up">
            {Object.entries(categorias).length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
                  style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.15)" }}
                >
                  <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Trayendo el menu...
                </p>
              </div>
            )}

            {(Object.entries(categorias) as [CategoriaMenu, ItemMenu[]][]).map(([categoria, items], indiceSeccion) => (
              <section key={categoria}>
                <div
                  className="flex items-center gap-2.5 mb-4 animate-fade-up"
                  style={{ animationDelay: `${indiceSeccion * 100}ms` }}
                >
                  <span className="text-lg">{ICONOS_CATEGORIA[categoria]}</span>
                  <h2
                    className="text-base font-bold"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                  >
                    {ETIQUETAS_CATEGORIA[categoria]}
                  </h2>
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>
                    {items.length} {items.length === 1 ? "opcion" : "opciones"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {items.map((item, indiceItem) => (
                    <div
                      key={item.id}
                      className="animate-fade-up"
                      style={{ animationDelay: `${indiceSeccion * 100 + indiceItem * 60}ms` }}
                    >
                      <TarjetaItemMenu item={item} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {pestana === "pedido" && (
          <div className="animate-fade-up">
            <FormularioPedido
              mesaId={mesa.id}
              mozoId={mozoIdPorDefecto}
              alEnviar={() => {
                cargarPorMesa(mesa.id);
                setPestana("estado");
              }}
            />
          </div>
        )}

        {pestana === "asistente" && (
          <div className="animate-fade-up">
            <ChatIa sesionQr={tokenQr} />
          </div>
        )}

        {pestana === "estado" && (
          <div className="space-y-4 animate-fade-up">
            {comandas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 text-2xl"
                  style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.15)" }}
                >
                  📋
                </div>
                <h3
                  className="font-bold"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                >
                  Todavia no hay pedidos
                </h3>
                <p className="text-sm text-center max-w-[220px]" style={{ color: "var(--text-muted)" }}>
                  Cuando hagas tu primer pedido, vas a ver el estado en tiempo real
                </p>
                <button
                  className="mt-2 text-xs font-semibold px-4 py-2 rounded-full transition-all"
                  style={{
                    background: "rgba(79,142,247,0.1)",
                    border: "1px solid rgba(79,142,247,0.2)",
                    color: "var(--accent-blue)",
                  }}
                  onClick={() => setPestana("menu")}
                >
                  Ver menu
                </button>
              </div>
            ) : (
              comandas.map((comanda, indice) => (
                <div
                  key={comanda.id}
                  className="glass p-4 animate-fade-up"
                  style={{
                    animationDelay: `${indice * 80}ms`,
                    borderLeft: `3px solid ${COLORES_ESTADO_BORDE[comanda.estado] || "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {tiempoRelativo(comanda.creadoEn)}
                    </span>
                    <IndicadorEstado estado={comanda.estado} tamano="sm" />
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {comanda.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>
                          <span
                            className="font-bold mr-1.5"
                            style={{ color: "var(--accent-blue)", fontFamily: "var(--font-heading)" }}
                          >
                            {item.cantidad}x
                          </span>
                          {item.nombreItem}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "var(--text-muted)", fontFamily: "var(--font-heading)" }}
                        >
                          ${item.subtotal.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr className="glow-divider" style={{ margin: "0.75rem 0" }} />

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Total</span>
                    <span
                      className="text-lg font-black"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--accent-emerald)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ${comanda.total.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
