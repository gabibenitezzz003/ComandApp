import { RepositorioMesa } from "../../dominio/interfaces-repositorios/repositorio-mesa";
import { CrearMesaDto, RespuestaMesaDto } from "../dtos/dto-mesa";
import { NoEncontrado, OperacionInvalida } from "../../dominio/excepciones/indice";

export class GestionarMesas {
  constructor(
    private readonly repositorioMesa: RepositorioMesa
  ) {}

  async obtenerTodas(): Promise<RespuestaMesaDto[]> {
    const mesas = await this.repositorioMesa.obtenerTodas();
    return mesas.map(this.mapearARespuesta);
  }

  async obtenerPorToken(tokenQr: string): Promise<RespuestaMesaDto> {
    const mesa = await this.repositorioMesa.obtenerPorToken(tokenQr);

    if (!mesa) {
      throw new NoEncontrado("Mesa", tokenQr);
    }

    if (!mesa.activa) {
      throw new OperacionInvalida("La mesa no esta activa");
    }

    return this.mapearARespuesta(mesa);
  }

  async crear(dto: CrearMesaDto): Promise<RespuestaMesaDto> {
    const mesaExistente = await this.repositorioMesa.obtenerPorNumero(dto.numero);

    if (mesaExistente) {
      throw new OperacionInvalida(`Ya existe una mesa con el numero ${dto.numero}`);
    }

    const mesa = await this.repositorioMesa.crear({
      numero: dto.numero,
      capacidad: dto.capacidad,
      activa: true,
    });

    return this.mapearARespuesta(mesa);
  }

  async actualizar(
    id: string,
    datos: Partial<{ numero: number; capacidad: number; activa: boolean }>
  ): Promise<RespuestaMesaDto> {
    const mesa = await this.repositorioMesa.obtenerPorId(id);

    if (!mesa) {
      throw new NoEncontrado("Mesa", id);
    }

    const mesaActualizada = await this.repositorioMesa.actualizar(id, datos);
    return this.mapearARespuesta(mesaActualizada);
  }

  private mapearARespuesta(mesa: {
    id: string;
    numero: number;
    capacidad: number;
    activa: boolean;
    tokenQr: string;
    creadoEn: Date;
    mozoAsignado?: { id: string; nombre: string } | null;
  }): RespuestaMesaDto {
    return {
      id: mesa.id,
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      activa: mesa.activa,
      tokenQr: mesa.tokenQr,
      creadoEn: mesa.creadoEn.toISOString(),
      mozoAsignado: mesa.mozoAsignado,
    };
  }
}
