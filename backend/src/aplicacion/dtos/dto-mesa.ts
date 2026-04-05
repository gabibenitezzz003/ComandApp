export interface CrearMesaDto {
  numero: number;
  capacidad: number;
}

export interface RespuestaMesaDto {
  id: string;
  numero: number;
  capacidad: number;
  activa: boolean;
  tokenQr: string;
  creadoEn: string;
  mozoAsignado?: { id: string; nombre: string } | null;
}
