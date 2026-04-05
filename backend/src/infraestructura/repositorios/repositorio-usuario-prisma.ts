import { PrismaClient } from "@prisma/client";
import { RepositorioUsuario } from "../../dominio/interfaces-repositorios/repositorio-usuario";
import { Usuario, RolUsuario } from "../../dominio/entidades/usuario";

export class RepositorioUsuarioPrisma implements RepositorioUsuario {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorId(id: string): Promise<Usuario | null> {
    const registro = await this.prisma.usuario.findUnique({ where: { id } });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    const registro = await this.prisma.usuario.findUnique({ where: { email } });
    return registro ? this.mapearAEntidad(registro) : null;
  }

  async obtenerMozosActivos(): Promise<Usuario[]> {
    const registros = await this.prisma.usuario.findMany({
      where: { rol: "MOZO", activo: true },
      orderBy: { nombre: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async obtenerTodos(): Promise<Usuario[]> {
    const registros = await this.prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
    });
    return registros.map(this.mapearAEntidad);
  }

  async crear(usuario: Omit<Usuario, "id" | "creadoEn">): Promise<Usuario> {
    const registro = await this.prisma.usuario.create({
      data: {
        nombre: usuario.nombre,
        email: usuario.email,
        clave: usuario.clave,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    });
    return this.mapearAEntidad(registro);
  }

  async actualizar(
    id: string,
    datos: Partial<Pick<Usuario, "nombre" | "email" | "clave" | "rol" | "activo">>
  ): Promise<Usuario> {
    const registro = await this.prisma.usuario.update({
      where: { id },
      data: datos,
    });
    return this.mapearAEntidad(registro);
  }

  private mapearAEntidad(registro: {
    id: string;
    nombre: string;
    email: string;
    clave: string;
    rol: string;
    activo: boolean;
    creadoEn: Date;
  }): Usuario {
    return new Usuario({
      id: registro.id,
      nombre: registro.nombre,
      email: registro.email,
      clave: registro.clave,
      rol: registro.rol as RolUsuario,
      activo: registro.activo,
      creadoEn: registro.creadoEn,
    });
  }
}
