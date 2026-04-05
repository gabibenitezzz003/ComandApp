export interface ServicioHash {
  hashear(texto: string): Promise<string>;
  comparar(texto: string, hash: string): Promise<boolean>;
}
