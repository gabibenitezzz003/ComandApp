"use client";

import { ButtonHTMLAttributes } from "react";

interface PropiedadesBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "peligro" | "fantasma";
  tamano?: "sm" | "md" | "lg";
  cargando?: boolean;
}

const ESTILOS_VARIANTE: Record<string, React.CSSProperties> = {
  primario: {
    background: "linear-gradient(135deg, var(--accent-blue), #6366f1)",
    color: "white",
    boxShadow: "0 4px 16px rgba(79,142,247,0.3)",
    border: "none",
  },
  secundario: {
    background: "rgba(255,255,255,0.06)",
    color: "var(--text-primary)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  peligro: {
    background: "rgba(239,68,68,0.12)",
    color: "#fc8181",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  fantasma: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent",
  },
};

const ESTILOS_TAMANO: Record<string, React.CSSProperties> = {
  sm: { padding: "0.375rem 0.75rem", fontSize: "0.8rem" },
  md: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
  lg: { padding: "0.75rem 1.5rem", fontSize: "1rem" },
};

export function Boton({
  variante = "primario",
  tamano = "md",
  cargando = false,
  children,
  disabled,
  className = "",
  style,
  ...props
}: PropiedadesBoton) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        ...ESTILOS_VARIANTE[variante],
        ...ESTILOS_TAMANO[tamano],
        fontFamily: "var(--font-heading)",
        opacity: disabled || cargando ? 0.5 : 1,
        cursor: disabled || cargando ? "not-allowed" : "pointer",
        ...style,
      }}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <svg
          className="animate-spin"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      {children}
    </button>
  );
}
