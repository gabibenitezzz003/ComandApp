export interface DatosToken {
  usuarioId: string;
  rol: string;
}

export interface ServicioToken {
  generar(datos: DatosToken): string;
  verificar(token: string): DatosToken;
}
