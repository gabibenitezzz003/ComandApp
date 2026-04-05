import { PrismaClient } from "@prisma/client";
import { RepositorioItemMenu } from "../../dominio/interfaces-repositorios/repositorio-item-menu";
import { ItemMenu, CategoriaMenu } from "../../dominio/entidades/item-menu";
import { Decimal } from "@prisma/client/runtime/library";

export class RepositorioItemMenuPrisma implements RepositorioItemMenu {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorId(id: string): Promise<ItemMenu | null> {
    const registro = await this.prisma.itemMenu.findUnique({ where: { id } });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerTodos(): Promise<ItemMenu[]> {
    const registros = await this.prisma.itemMenu.findMany({
      orderBy: { categoria: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerDisponibles(): Promise<ItemMenu[]> {
    const registros = await this.prisma.itemMenu.findMany({
      where: { disponible: true },
      orderBy: { categoria: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerPorCategoria(categoria: CategoriaMenu): Promise<ItemMenu[]> {
    const registros = await this.prisma.itemMenu.findMany({
      where: { categoria },
      orderBy: { nombre: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async crear(item: Omit<ItemMenu, "id" | "creadoEn" | "actualizadoEn">): Promise<ItemMenu> {
    const registro = await this.prisma.itemMenu.create({
      data: {
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        categoria: item.categoria,
        disponible: item.disponible,
        imagenUrl: item.imagenUrl,
        tiempoPreparacion: item.tiempoPreparacion,
      },
    });
    return this.mapearAEntidad(registro);
  }

  async actualizar(
    id: string,
    datos: Partial<Omit<ItemMenu, "id" | "creadoEn" | "actualizadoEn">>
  ): Promise<ItemMenu> {
    const registro = await this.prisma.itemMenu.update({
      where: { id },
      data: datos,
    });
    return this.mapearAEntidad(registro);
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.itemMenu.delete({ where: { id } });
  }

  private mapearAEntidad(registro: {
    id: string;
    nombre: string;
    descripcion: string;
    precio: Decimal;
    categoria: string;
    disponible: boolean;
    imagenUrl: string | null;
    tiempoPreparacion: number;
    creadoEn: Date;
    actualizadoEn: Date;
  }): ItemMenu {
    return new ItemMenu({
      id: registro.id,
      nombre: registro.nombre,
      descripcion: registro.descripcion,
      precio: Number(registro.precio),
      categoria: registro.categoria as CategoriaMenu,
      disponible: registro.disponible,
      imagenUrl: registro.imagenUrl,
      tiempoPreparacion: registro.tiempoPreparacion,
      creadoEn: registro.creadoEn,
      actualizadoEn: registro.actualizadoEn,
    });
  }
}
