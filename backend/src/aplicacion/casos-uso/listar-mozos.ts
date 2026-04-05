import { RepositorioUsuario } from "../../dominio/interfaces-repositorios/repositorio-usuario";

export class ListarMozos {
  constructor(private readonly repositorioUsuario: RepositorioUsuario) {}

  async ejecutar(): Promise<{ id: string; nombre: string }[]> {
    const mozos = await this.repositorioUsuario.obtenerMozosActivos();
    return mozos.map(m => ({ id: m.id, nombre: m.nombre }));
  }
}
