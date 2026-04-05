import { ItemMenu, CategoriaMenu } from "../entidades/item-menu";

export interface RepositorioItemMenu {
  obtenerPorId(id: string): Promise<ItemMenu | null>;
  obtenerTodos(): Promise<ItemMenu[]>;
  obtenerDisponibles(): Promise<ItemMenu[]>;
  obtenerPorCategoria(categoria: CategoriaMenu): Promise<ItemMenu[]>;
  crear(item: Omit<ItemMenu, "id" | "creadoEn" | "actualizadoEn">): Promise<ItemMenu>;
  actualizar(id: string, datos: Partial<Omit<ItemMenu, "id" | "creadoEn" | "actualizadoEn">>): Promise<ItemMenu>;
  eliminar(id: string): Promise<void>;
}
