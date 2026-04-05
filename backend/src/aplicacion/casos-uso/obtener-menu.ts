import { RepositorioItemMenu } from "../../dominio/interfaces-repositorios/repositorio-item-menu";
import { RespuestaItemMenuDto } from "../dtos/dto-item-menu";
import { CategoriaMenu } from "../../dominio/entidades/item-menu";

export class ObtenerMenu {
  constructor(
    private readonly repositorioItemMenu: RepositorioItemMenu
  ) {}

  async ejecutarTodos(): Promise<RespuestaItemMenuDto[]> {
    const items = await this.repositorioItemMenu.obtenerDisponibles();
    return items.map(this.mapearARespuesta);
  }

  async ejecutarPorCategoria(categoria: CategoriaMenu): Promise<RespuestaItemMenuDto[]> {
    const items = await this.repositorioItemMenu.obtenerPorCategoria(categoria);
    return items.filter((item) => item.disponible).map(this.mapearARespuesta);
  }

  private mapearARespuesta(item: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria: CategoriaMenu;
    disponible: boolean;
    imagenUrl: string | null;
    tiempoPreparacion: number;
  }): RespuestaItemMenuDto {
    return {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      categoria: item.categoria,
      disponible: item.disponible,
      imagenUrl: item.imagenUrl,
      tiempoPreparacion: item.tiempoPreparacion,
    };
  }
}
