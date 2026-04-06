"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// ────────────────────────────────────────────────────────────────
// Types (Local for simplicity)
// ────────────────────────────────────────────────────────────────
interface ItemMenu {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
  disponible: boolean;
  imagenUrl: string | null;
}

interface MesaInfo {
  id: string;
  numero: number;
  activa: boolean;
  tieneMozo: boolean;
}

interface CartItem {
  id: string; // id temporal para React (Date.now)
  menuId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  notas: string;
}

const URL_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

// ────────────────────────────────────────────────────────────────
// Componente Principal
// ────────────────────────────────────────────────────────────────
export default function MenuPublicoCarta() {
  const { tokenQr } = useParams();
  const router = useRouter();

  const [mesa, setMesa] = useState<MesaInfo | null>(null);
  const [menu, setMenu] = useState<ItemMenu[]>([]);
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [pedidoExito, setPedidoExito] = useState(false);

  // Carga inicial
  useEffect(() => {
    const fetchInicial = async () => {
      try {
        const resMesa = await fetch(`${URL_BASE}/publico/mesas/${tokenQr}`);
        const dataMesa = await resMesa.json();

        if (!dataMesa.exito) {
          setErrorStatus(dataMesa.error?.mensaje ?? "Mesa no válida");
          setCargando(false);
          return;
        }

        setMesa(dataMesa.datos);

        const resMenu = await fetch(`${URL_BASE}/menu`);
        const dataMenu = await resMenu.json();
        
        if (dataMenu.exito) {
          setMenu(dataMenu.datos.filter((m: ItemMenu) => m.disponible));
        }
      } catch (err) {
        setErrorStatus("Error de conexión");
      } finally {
        setCargando(false);
      }
    };

    if (tokenQr) fetchInicial();
  }, [tokenQr]);

  // Agrupación por categoría
  const menuPorCategoria = useMemo(() => {
    const agrupado: Record<string, ItemMenu[]> = {};
    menu.forEach(item => {
      if (!agrupado[item.categoria]) agrupado[item.categoria] = [];
      agrupado[item.categoria].push(item);
    });
    return agrupado;
  }, [menu]);

  // Acciones Carrito
  const agregarAlCarrito = (item: ItemMenu) => {
    const notas = prompt(`¿Alguna nota especial para "${item.nombre}"? (Opcional):`);
    if (notas === null) return; // canceló

    setCarrito(prev => [...prev, {
      id: Date.now().toString(),
      menuId: item.id,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: 1,
      notas: notas.trim()
    }]);
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(c => c.id !== id));
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // Enviar Pedido
  const enviarPedido = async () => {
    if (carrito.length === 0) return;
    setEnviando(true);
    try {
      const res = await fetch(`${URL_BASE}/publico/mesas/${tokenQr}/pedir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observaciones: "Pedido desde el Auto-Menú QR 📱",
          items: carrito.map(c => ({
            itemMenuId: c.menuId,
            cantidad: c.cantidad,
            notas: c.notas || null
          }))
        })
      });
      const data = await res.json();
      if (data.exito) {
        setPedidoExito(true);
        setCarrito([]);
        setTimeout(() => setPedidoExito(false), 5000);
      } else {
        alert("Error al enviar el pedido: " + data.error?.mensaje);
      }
    } catch {
      alert("Error de red al enviar el pedido");
    } finally {
      setEnviando(false);
    }
  };

  const llamarAlMozo = async () => {
    try {
      await fetch(`${URL_BASE}/publico/mesas/${tokenQr}/llamar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: "mozo" })
      });
      alert("👨‍🍳 ¡El mozo está en camino!");
    } catch {
      alert("Error al llamar al mozo");
    }
  };

  // --- Renderizado Estados Especiales ---
  if (cargando) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#f8fafc" }}>Cargando carta mágica... ✨</div>;
  }

  if (errorStatus) {
    return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#f87171", padding: "20px", textAlign: "center", flexDirection: "column" }}>
      <span style={{ fontSize: "40px", marginBottom: "10px" }}>😢</span>
      <h3>{errorStatus}</h3>
    </div>;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at top, #1e293b, #0f172a)",
      color: "#f8fafc",
      paddingBottom: carrito.length > 0 ? "120px" : "20px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header Fijo */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(16px)",
        background: "rgba(15,23,42,0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "16px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, background: "linear-gradient(to right, #a78bfa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ComandApp
          </h1>
          <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Mesa {mesa?.numero}</span>
            {!mesa?.activa && <span style={{ color: "#f87171" }}>(No cobrada aún)</span>}
          </div>
        </div>
        <button onClick={llamarAlMozo} style={{
          background: "rgba(59,130,246,0.15)",
          color: "#60a5fa",
          border: "1px solid rgba(59,130,246,0.3)",
          borderRadius: "99px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer"
        }}>🔔 Llamar Mozo</button>
      </header>

      {/* Hero */}
      <div style={{ padding: "30px 20px 10px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", margin: "0 0 8px 0", fontWeight: 800 }}>Nuestro Menú</h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>Toca cualquier plato para agregarlo a tu orden.</p>
      </div>

      {/* Success interactivo */}
      {pedidoExito && (
        <div style={{ margin: "20px", padding: "16px", background: "rgba(16,185,129,0.15)", border: "1px solid #34d399", borderRadius: "12px", color: "#34d399", textAlign: "center", fontWeight: 700 }}>
          👨‍🍳 ¡Marchando! Tu pedido fue enviado a la cocina.
        </div>
      )}

      {/* Listado agrupado por categorías */}
      <main style={{ padding: "0 20px" }}>
        {Object.entries(menuPorCategoria).map(([categoria, items]) => (
          <div key={categoria} style={{ marginBottom: "32px" }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              paddingBottom: "8px",
              marginBottom: "16px",
              color: "#e2e8f0"
            }}>
              {categoria}
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
              {items.map(item => (
                <div key={item.id} onClick={() => agregarAlCarrito(item)} style={{
                  background: "rgba(30,41,59,0.5)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}>
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <div style={{ fontWeight: 700, fontSize: "16px", color: "#f8fafc", marginBottom: "4px" }}>{item.nombre}</div>
                    {item.descripcion && <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.4, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.descripcion}</div>}
                    <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "15px" }}>${item.precio.toFixed(2)}</div>
                  </div>
                  <div style={{ width: "40px", height: "40px", background: "rgba(167,139,250,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc", fontSize: "20px", flexShrink: 0 }}>
                    +
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Panel */}
      {carrito.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          right: "20px",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: "24px",
          padding: "16px 20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(167,139,250,0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 50,
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ flex: 1, marginRight: "16px", maxHeight: "100px", overflowY: "auto" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", marginBottom: "4px", fontWeight: 800 }}>Tú Pedido</div>
            {carrito.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "4px" }}>
                <span><button onClick={(e) => { e.stopPropagation(); eliminarDelCarrito(item.id); }} style={{ background: "none", border: "none", color: "#f87171", marginRight: "6px", cursor: "pointer", padding: 0 }}>✕</button> {item.cantidad}x {item.nombre}</span>
                <span style={{ color: "#cbd5e1" }}>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={enviarPedido}
            disabled={enviando}
            style={{
              background: "linear-gradient(to right, #8b5cf6, #c084fc)",
              color: "white",
              border: "none",
              borderRadius: "16px",
              padding: "16px 24px",
              fontSize: "15px",
              fontWeight: 800,
              cursor: enviando ? "wait" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 4px 14px rgba(139,92,246,0.4)"
            }}
          >
            <span>{enviando ? "ENVIANDO..." : "ENVIAR"}</span>
            <span style={{ fontSize: "12px", opacity: 0.9 }}>${totalCarrito.toFixed(2)}</span>
          </button>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
