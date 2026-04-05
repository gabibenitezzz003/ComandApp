"use client";

import { EstadoComanda, ETIQUETAS_ESTADO } from "../../tipos/tipos-comanda";

interface PropiedadesIndicadorEstado {
  estado: EstadoComanda;
  tamano?: "sm" | "md" | "lg";
}

const CLASES_ESTADO: Record<EstadoComanda, string> = {
  RECIBIDO: "status-recibido",
  EN_PREPARACION: "status-en-preparacion",
  LISTO_PARA_SERVIR: "status-listo",
  ENTREGADO: "status-entregado",
  INCIDENCIA: "status-incidencia",
  PAGADO: "status-pagado",
};

const COLORES_PUNTO: Record<EstadoComanda, string> = {
  RECIBIDO: "#FDE047",
  EN_PREPARACION: "#FB923C",
  LISTO_PARA_SERVIR: "#4ADE80",
  ENTREGADO: "#60A5FA",
  INCIDENCIA: "#F87171",
  PAGADO: "#34D399",
};

export function IndicadorEstado({ estado, tamano = "md" }: PropiedadesIndicadorEstado) {
  const etiqueta = ETIQUETAS_ESTADO[estado];

  const estilosTamano = {
    sm: { padding: "0.2rem 0.625rem", fontSize: "0.7rem", gap: "0.35rem" },
    md: { padding: "0.3rem 0.75rem", fontSize: "0.75rem", gap: "0.4rem" },
    lg: { padding: "0.4rem 1rem", fontSize: "0.8rem", gap: "0.5rem" },
  };

  const animaPulso = estado === "EN_PREPARACION" || estado === "LISTO_PARA_SERVIR";

  return (
    <span
      className={`${CLASES_ESTADO[estado]} inline-flex items-center rounded-full font-semibold`}
      style={{
        ...estilosTamano[tamano],
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <span
        className={animaPulso ? "animate-pulse" : ""}
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: COLORES_PUNTO[estado],
          boxShadow: `0 0 6px ${COLORES_PUNTO[estado]}`,
          flexShrink: 0,
          marginRight: estilosTamano[tamano].gap,
        }}
      />
      {etiqueta}
    </span>
  );
}
