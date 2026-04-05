"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usarEstadoAutenticacion } from "../../estados/estado-autenticacion";
import { esquemaLogin, DatosLogin } from "../../validadores/validador-formularios";

interface PropiedadesFormularioLogin {
  titulo: string;
}

export function FormularioLogin({ titulo }: PropiedadesFormularioLogin) {
  const { login } = usarEstadoAutenticacion();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DatosLogin>({
    resolver: zodResolver(esquemaLogin),
  });

  const manejarEnvio = async (datos: DatosLogin) => {
    setCargando(true);
    setError(null);
    try {
      await login(datos.email, datos.clave);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales incorrectas");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="saas-card p-6 sm:p-8 w-full max-w-sm anim-puff-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1 text-text-primary">
          {titulo}
        </h2>
        <p className="text-sm text-text-secondary">
          Ingresá tus credenciales para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit(manejarEnvio)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">
            Email
          </label>
          <input
            type="email"
            className="saas-input"
            placeholder="tu@email.com"
            {...register("email")}
            disabled={cargando}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-text-primary">
            Contraseña
          </label>
          <input
            type="password"
            className="saas-input"
            placeholder="••••••••"
            {...register("clave")}
            disabled={cargando}
          />
          {errors.clave && (
            <p className="mt-1 text-xs text-red-500">
              {errors.clave.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-md text-sm border border-red-500/20 bg-red-500/10 text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="saas-btn-primary w-full mt-2"
          disabled={cargando}
        >
          {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
