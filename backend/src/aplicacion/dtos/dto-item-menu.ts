import { CategoriaMenu } from "../../dominio/entidades/item-menu";

export interface CrearItemMenuDto {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaMenu;
  imagenUrl: string | null;
  tiempoPreparacion: number;
}

export interface RespuestaItemMenuDto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaMenu;
  disponible: boolean;
  imagenUrl: string | null;
  tiempoPreparacion: number;
}
