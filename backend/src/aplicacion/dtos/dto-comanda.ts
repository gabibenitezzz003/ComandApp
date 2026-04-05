import { EstadoComanda } from "../../dominio/entidades/comanda";

export interface CrearComandaDto {
  mesaId: string;
  mozoId: string;
  observaciones: string | null;
  items: ItemComandaDto[];
}

export interface ItemComandaDto {
  itemMenuId: string;
  cantidad: number;
  notas: string | null;
}

export interface ActualizarEstadoDto {
  comandaId: string;
  nuevoEstado: EstadoComanda;
}

export interface RespuestaComandaDto {
  id: string;
  mesaId: string;
  mesaNumero: number;
  mozoId: string;
  mozoNombre: string;
  estado: EstadoComanda;
  observaciones: string | null;
  total: number;
  items: RespuestaItemComandaDto[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface RespuestaItemComandaDto {
  id: string;
  itemMenuId: string;
  nombreItem: string;
  cantidad: number;
  notas: string | null;
  precioUnitario: number;
  subtotal: number;
}
