export type EstadoComanda =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "LISTO_PARA_SERVIR"
  | "ENTREGADO"
  | "INCIDENCIA"
  | "PAGADO";

export type MetodoPago = "EFECTIVO" | "TARJETA" | "QR_DIGITAL";

export type CategoriaMenu =
  | "ENTRADA"
  | "PLATO_PRINCIPAL"
  | "POSTRE"
  | "BEBIDA"
  | "SNACK";

export type RolUsuario = "ADMIN" | "MOZO" | "COCINA";

export interface ItemMenu {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaMenu;
  disponible: boolean;
  imagenUrl: string | null;
  tiempoPreparacion: number;
}

export interface ItemCarrito {
  itemMenu: ItemMenu;
  cantidad: number;
  notas: string | null;
}

export interface Comanda {
  id: string;
  mesaId: string;
  mesaNumero?: number;
  mozoId: string;
  mozoNombre?: string;
  estado: EstadoComanda;
  observaciones: string | null;
  total: number;
  items: ItemComandaDetalle[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface ItemComandaDetalle {
  id: string;
  itemMenuId: string;
  nombreItem: string;
  cantidad: number;
  notas: string | null;
  precioUnitario: number;
  subtotal: number;
}

export interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  activa: boolean;
  tokenQr: string;
  creadoEn: string;
  mozoAsignado?: { id: string; nombre: string } | null;
}

export interface Pago {
  id: string;
  comandaId: string;
  monto: number;
  metodo: MetodoPago;
  referencia: string | null;
  creadoEn: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface RespuestaApi<T> {
  exito: boolean;
  datos: T;
  error?: {
    codigo: string;
    mensaje: string;
  };
}

export const COLORES_ESTADO: Record<EstadoComanda, string> = {
  RECIBIDO: "#FDE047",
  EN_PREPARACION: "#FB923C",
  LISTO_PARA_SERVIR: "#4ADE80",
  ENTREGADO: "#60A5FA",
  INCIDENCIA: "#F87171",
  PAGADO: "#34D399",
};

export const ETIQUETAS_ESTADO: Record<EstadoComanda, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En preparacion",
  LISTO_PARA_SERVIR: "Listo para servir",
  ENTREGADO: "Entregado",
  INCIDENCIA: "Incidencia",
  PAGADO: "Pagado",
};

export const ETIQUETAS_CATEGORIA: Record<CategoriaMenu, string> = {
  ENTRADA: "Entradas",
  PLATO_PRINCIPAL: "Platos principales",
  POSTRE: "Postres",
  BEBIDA: "Bebidas",
  SNACK: "Snacks",
};
