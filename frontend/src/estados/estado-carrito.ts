import { create } from "zustand";
import { ItemMenu, ItemCarrito } from "../tipos/tipos-comanda";

interface EstadoCarrito {
  items: ItemCarrito[];
  observaciones: string;
  agregarItem: (itemMenu: ItemMenu) => void;
  eliminarItem: (itemMenuId: string) => void;
  actualizarCantidad: (itemMenuId: string, cantidad: number) => void;
  actualizarNotas: (itemMenuId: string, notas: string) => void;
  establecerObservaciones: (observaciones: string) => void;
  vaciarCarrito: () => void;
  obtenerTotal: () => number;
  obtenerCantidadTotal: () => number;
}

export const usarEstadoCarrito = create<EstadoCarrito>((set, get) => ({
  items: [],
  observaciones: "",

  agregarItem: (itemMenu: ItemMenu) => {
    set((estado) => {
      const existente = estado.items.find(
        (item) => item.itemMenu.id === itemMenu.id
      );

      if (existente) {
        return {
          items: estado.items.map((item) =>
            item.itemMenu.id === itemMenu.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
        };
      }

      return {
        items: [...estado.items, { itemMenu, cantidad: 1, notas: null }],
      };
    });
  },

  eliminarItem: (itemMenuId: string) => {
    set((estado) => ({
      items: estado.items.filter((item) => item.itemMenu.id !== itemMenuId),
    }));
  },

  actualizarCantidad: (itemMenuId: string, cantidad: number) => {
    if (cantidad <= 0) {
      get().eliminarItem(itemMenuId);
      return;
    }

    set((estado) => ({
      items: estado.items.map((item) =>
        item.itemMenu.id === itemMenuId ? { ...item, cantidad } : item
      ),
    }));
  },

  actualizarNotas: (itemMenuId: string, notas: string) => {
    set((estado) => ({
      items: estado.items.map((item) =>
        item.itemMenu.id === itemMenuId
          ? { ...item, notas: notas || null }
          : item
      ),
    }));
  },

  establecerObservaciones: (observaciones: string) => {
    set({ observaciones });
  },

  vaciarCarrito: () => {
    set({ items: [], observaciones: "" });
  },

  obtenerTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.itemMenu.precio * item.cantidad,
      0
    );
  },

  obtenerCantidadTotal: () => {
    return get().items.reduce((total, item) => total + item.cantidad, 0);
  },
}));
