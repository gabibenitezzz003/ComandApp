"use client";

import { useState, useRef, useEffect } from "react";
import { clienteApi } from "../../servicios/cliente-api";

interface MensajeChat {
  tipo: "usuario" | "asistente";
  contenido: string;
}

interface PropiedadesChatIa {
  sesionQr: string;
}

export function ChatIa({ sesionQr }: PropiedadesChatIa) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [consulta, setConsulta] = useState("");
  const [consultando, setConsultando] = useState(false);
  const refScroll = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight;
    }
  }, [mensajes, consultando]);

  const enviarConsulta = async () => {
    if (!consulta.trim() || consultando) return;

    const textoConsulta = consulta.trim();
    setMensajes((prev) => [...prev, { tipo: "usuario", contenido: textoConsulta }]);
    setConsulta("");
    setConsultando(true);

    try {
      const resultado = await clienteApi.post<{ respuesta: string; tokensUsados: number }>(
        "/ia/consultar",
        { consulta: textoConsulta, sesionQr }
      );
      setMensajes((prev) => [...prev, { tipo: "asistente", contenido: resultado.respuesta }]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        { tipo: "asistente", contenido: "Mmm, no pude procesar eso. Intenta con otra pregunta o consultale al mozo." },
      ]);
    } finally {
      setConsultando(false);
    }
  };

  return (
    <div className="glass flex flex-col" style={{ height: "28rem" }}>
      <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
            style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(79,142,247,0.2))", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            ✨
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              Asistente del menu
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Preguntame sobre platos, ingredientes o recomendaciones
            </p>
          </div>
        </div>
      </div>

      <div ref={refScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensajes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="text-3xl">🍽️</div>
            <p className="text-sm text-center max-w-[200px]" style={{ color: "var(--text-muted)" }}>
              Pregunta lo que quieras sobre el menu
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {["Que me recomendas?", "Algo sin gluten?", "Que va con cerveza?"].map((sug) => (
                <button
                  key={sug}
                  className="text-xs px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: "rgba(79,142,247,0.08)",
                    border: "1px solid rgba(79,142,247,0.15)",
                    color: "var(--accent-blue)",
                  }}
                  onClick={() => { setConsulta(sug); }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((mensaje, indice) => (
          <div
            key={indice}
            className={`flex ${mensaje.tipo === "usuario" ? "justify-end" : "justify-start"} animate-fade-up`}
            style={{ animationDuration: "0.3s" }}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
              style={
                mensaje.tipo === "usuario"
                  ? {
                      background: "linear-gradient(135deg, var(--accent-blue), #6366f1)",
                      color: "white",
                      borderBottomRightRadius: "6px",
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "var(--text-primary)",
                      borderBottomLeftRadius: "6px",
                    }
              }
            >
              {mensaje.contenido}
            </div>
          </div>
        ))}

        {consultando && (
          <div className="flex justify-start animate-fade-up" style={{ animationDuration: "0.3s" }}>
            <div
              className="rounded-2xl px-4 py-3 flex gap-1.5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderBottomLeftRadius: "6px" }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: "var(--accent-purple)",
                    animationDelay: `${i * 200}ms`,
                    animationDuration: "1s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-premium flex-1 text-sm"
            style={{ padding: "0.625rem 0.875rem", borderRadius: "100px" }}
            placeholder="Escribe tu pregunta..."
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarConsulta()}
          />
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0"
            style={{
              background: consulta.trim()
                ? "linear-gradient(135deg, var(--accent-blue), #6366f1)"
                : "rgba(255,255,255,0.06)",
              color: consulta.trim() ? "white" : "var(--text-muted)",
              boxShadow: consulta.trim() ? "0 4px 16px rgba(79,142,247,0.4)" : "none",
              cursor: consulta.trim() ? "pointer" : "default",
            }}
            onClick={enviarConsulta}
            disabled={consultando || !consulta.trim()}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
