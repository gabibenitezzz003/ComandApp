export type CategoriaMenu =
  | "ENTRADA"
  | "PLATO_PRINCIPAL"
  | "POSTRE"
  | "BEBIDA"
  | "SNACK";

export class ItemMenu {
  readonly id: string;
  readonly nombre: string;
  readonly descripcion: string;
  readonly precio: number;
  readonly categoria: CategoriaMenu;
  readonly disponible: boolean;
  readonly imagenUrl: string | null;
  readonly tiempoPreparacion: number;
  readonly creadoEn: Date;
  readonly actualizadoEn: Date;

  constructor(parametros: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: CategoriaMenu;
    disponible: boolean;
    imagenUrl: string | null;
    tiempoPreparacion: number;
    creadoEn: Date;
    actualizadoEn: Date;
  }) {
    this.id = parametros.id;
    this.nombre = parametros.nombre;
    this.descripcion = parametros.descripcion;
    this.precio = parametros.precio;
    this.categoria = parametros.categoria;
    this.disponible = parametros.disponible;
    this.imagenUrl = parametros.imagenUrl;
    this.tiempoPreparacion = parametros.tiempoPreparacion;
    this.creadoEn = parametros.creadoEn;
    this.actualizadoEn = parametros.actualizadoEn;
  }
}
