import { MetodoPago } from "../../dominio/entidades/pago";

export interface CrearPagoDto {
  comandaId: string;
  metodo: MetodoPago;
  referencia: string | null;
}

export interface RespuestaPagoDto {
  id: string;
  comandaId: string;
  monto: number;
  metodo: MetodoPago;
  referencia: string | null;
  creadoEn: string;
}
