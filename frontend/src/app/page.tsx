"use client";

import Link from "next/link";
import { useEffect } from "react";

const FEATURES = [
  { title: "Sincronización WebSocket", desc: "La comunicación entre las mesas, la cocina y los mozos ocurre en tiempo real y con latencia ultrabaja." },
  { title: "Asistencia de IA", desc: "Los comensales pueden consultar el menú y obtener recomendaciones personalizadas gracias a Gemini AI." },
  { title: "Gestión sin fricción", desc: "El comensal escanea un código QR en la mesa para acceder al menú. No requiere instalar ninguna aplicación." },
  { title: "Métricas y Análisis", desc: "Monitorea el rendimiento del restaurante con el dashboard de administración y visualiza tiempos de entrega." },
];

export default function PaginaInicio() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("anim-fade-in-bottom");
            entry.target.classList.remove("opacity-0");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      el.classList.add("opacity-0");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "var(--bg-main)" }}>
      <div className="bg-grid-subtle" />
      
      {/* Navbar area */}
      <nav className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between anim-fade-in-bottom">
        <div className="font-semibold text-lg tracking-tight">ComandApp</div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border saas-card text-xs font-medium text-text-secondary anim-puff-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Sistema V1.0 en producción
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-primary anim-tracking-in-expand">
          Gestión de comandas,
          <br className="hidden sm:block" /> rediseñada.
        </h1>

        <p className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl mx-auto anim-fade-in-bottom del-200">
          Infraestructura de alto rendimiento para bares y restaurantes. 
          Pedidos instantáneos mediante QR y paneles en tiempo real para tu equipo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 anim-fade-in-bottom del-300">
          <Link href="/tablero" className="saas-btn-primary w-full sm:w-auto">
            Acceso Mozo
          </Link>
          <Link href="/dashboard" className="saas-btn-secondary w-full sm:w-auto">
            Panel de Control
          </Link>
        </div>
      </section>

      {/* Grid Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="grid md:grid-cols-2 gap-8">
          {FEATURES.map((f, i) => (
            <div 
              key={f.title} 
              data-reveal
              className="saas-card p-8"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="h-6 w-6 mb-4 rounded bg-text-secondary opacity-20"></div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-text-secondary leading-relaxed text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-12 border-t text-sm text-text-muted flex justify-between items-center" style={{ borderColor: "var(--border-subtle)" }}>
        <div>© {new Date().getFullYear()} ComandApp.</div>
        <div className="flex gap-4">
          <Link href="/tablero" className="hover:text-text-primary transition-colors">Mozo</Link>
          <Link href="/dashboard" className="hover:text-text-primary transition-colors">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
