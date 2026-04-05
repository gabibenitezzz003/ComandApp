import { create } from "zustand";
import { Comanda } from "../tipos/tipos-comanda";
import { clienteApi } from "../servicios/cliente-api";

interface EstadoComandas {
  comandas: Comanda[];
  cargando: boolean;
  cargarActivas: () => Promise<void>;
  cargarTodas: () => Promise<void>;
  cargarPorMesa: (mesaId: string) => Promise<void>;
  actualizarComanda: (comanda: Comanda) => void;
  agregarComanda: (comanda: Comanda) => void;
}

export const usarEstadoComandas = create<EstadoComandas>((set) => ({
  comandas: [],
  cargando: false,

  cargarActivas: async () => {
    set({ cargando: true });
    const datos = await clienteApi.get<Comanda[]>("/comandas/activas");
    set({ comandas: datos, cargando: false });
  },

  cargarTodas: async () => {
    set({ cargando: true });
    const datos = await clienteApi.get<Comanda[]>("/comandas");
    set({ comandas: datos, cargando: false });
  },

  cargarPorMesa: async (mesaId: string) => {
    set({ cargando: true });
    const datos = await clienteApi.get<Comanda[]>(`/comandas/mesa/${mesaId}`);
    set({ comandas: datos, cargando: false });
  },

  actualizarComanda: (comandaActualizada: Comanda) => {
    set((estado) => ({
      comandas: estado.comandas.map((comanda) =>
        comanda.id === comandaActualizada.id ? comandaActualizada : comanda
      ),
    }));
  },

  agregarComanda: (nuevaComanda: Comanda) => {
    set((estado) => ({
      comandas: [nuevaComanda, ...estado.comandas],
    }));
  },
}));
