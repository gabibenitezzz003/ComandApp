import { Usuario } from "../entidades/usuario";

export interface RepositorioUsuario {
  obtenerPorId(id: string): Promise<Usuario | null>;
  obtenerPorEmail(email: string): Promise<Usuario | null>;
  obtenerMozosActivos(): Promise<Usuario[]>;
  obtenerTodos(): Promise<Usuario[]>;
  crear(usuario: Omit<Usuario, "id" | "creadoEn">): Promise<Usuario>;
  actualizar(id: string, datos: Partial<Pick<Usuario, "nombre" | "email" | "clave" | "rol" | "activo">>): Promise<Usuario>;
}
