export interface RespuestaIa {
  respuesta: string;
  tokensUsados: number;
}

export interface ServicioIa {
  consultarMenu(consulta: string, sesionQr: string): Promise<RespuestaIa>;
  indexarMenu(): Promise<void>;
  sugerirUpsell(carrito: string[]): Promise<RespuestaIa>;
}
