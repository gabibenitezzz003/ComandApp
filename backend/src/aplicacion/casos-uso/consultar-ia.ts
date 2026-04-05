import { ServicioIa } from "../interfaces-infraestructura/servicio-ia";
import { RepositorioHistorialIa } from "../../dominio/interfaces-repositorios/repositorio-historial-ia";
import { ConsultaIaDto, RespuestaIaDto } from "../dtos/dto-ia";

const TOKENS_MAXIMO_SESION = 5000;
const RESPUESTA_LIMITE_ALCANZADO = "Has alcanzado el limite de consultas para esta sesion. Por favor, consulta directamente el menu o pide ayuda al mozo.";

export class ConsultarIa {
  constructor(
    private readonly servicioIa: ServicioIa,
    private readonly repositorioHistorialIa: RepositorioHistorialIa
  ) {}

  async ejecutar(dto: ConsultaIaDto): Promise<RespuestaIaDto> {
    const tokensUsados = await this.repositorioHistorialIa.obtenerTokensTotalesPorSesion(
      dto.sesionQr
    );

    if (tokensUsados >= TOKENS_MAXIMO_SESION) {
      return this.generarRespuestaLimite(dto.sesionQr, dto.consulta);
    }

    const respuesta = await this.servicioIa.consultarMenu(dto.consulta, dto.sesionQr);

    await this.repositorioHistorialIa.crear({
      sesionQr: dto.sesionQr,
      consulta: dto.consulta,
      respuesta: respuesta.respuesta,
      tokensUsados: respuesta.tokensUsados,
      contexto: dto.consulta,
    });

    return {
      respuesta: respuesta.respuesta,
      tokensUsados: respuesta.tokensUsados,
    };
  }

  private async generarRespuestaLimite(
    sesionQr: string,
    consulta: string
  ): Promise<RespuestaIaDto> {
    await this.repositorioHistorialIa.crear({
      sesionQr,
      consulta,
      respuesta: RESPUESTA_LIMITE_ALCANZADO,
      tokensUsados: 0,
      contexto: "LIMITE_ALCANZADO",
    });

    return {
      respuesta: RESPUESTA_LIMITE_ALCANZADO,
      tokensUsados: 0,
    };
  }
}
