"use client";

import { HTMLAttributes } from "react";

interface PropiedadesTarjeta extends HTMLAttributes<HTMLDivElement> {
  titulo?: string;
}

export function Tarjeta({ titulo, children, className = "", style, ...props }: PropiedadesTarjeta) {
  return (
    <div
      className={`glass p-6 ${className}`}
      style={style}
      {...props}
    >
      {titulo && (
        <h3
          className="mb-4 text-lg font-bold"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          {titulo}
        </h3>
      )}
      {children}
    </div>
  );
}
