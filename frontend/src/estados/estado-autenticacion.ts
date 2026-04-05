import { create } from "zustand";
import { Usuario } from "../tipos/tipos-comanda";
import { clienteApi } from "../servicios/cliente-api";

interface EstadoAutenticacion {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  login: (email: string, clave: string) => Promise<void>;
  cerrarSesion: () => void;
  cargarDesdeStorage: () => void;
}

export const usarEstadoAutenticacion = create<EstadoAutenticacion>((set) => ({
  usuario: null,
  token: null,
  cargando: false,

  login: async (email: string, clave: string) => {
    set({ cargando: true });
    const resultado = await clienteApi.post<{ token: string; usuario: Usuario }>(
      "/auth/login",
      { email, clave }
    );
    localStorage.setItem("token", resultado.token);
    localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
    set({ usuario: resultado.usuario, token: resultado.token, cargando: false });
  },

  cerrarSesion: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    set({ usuario: null, token: null });
  },

  cargarDesdeStorage: () => {
    const token = localStorage.getItem("token");
    const usuarioJson = localStorage.getItem("usuario");
    if (token && usuarioJson) {
      set({ usuario: JSON.parse(usuarioJson), token });
    }
  },
}));
