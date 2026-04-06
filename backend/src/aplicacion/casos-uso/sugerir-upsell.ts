import { ServicioIa } from "../interfaces-infraestructura/servicio-ia";
import { RespuestaIaDto } from "../dtos/dto-ia";
import { z } from "zod";

const esquemaUpsell = z.object({
  carrito: z.array(z.string()).min(1, "El carrito debe tener al menos un item para sugerir cosas.")
});

export type ComandaUpsellDto = z.infer<typeof esquemaUpsell>;

export class SugerirUpsell {
  constructor(private readonly servicioIa: ServicioIa) {}

  async ejecutar(dto: ComandaUpsellDto): Promise<RespuestaIaDto> {
    const validado = esquemaUpsell.parse(dto);
    const respuesta = await this.servicioIa.sugerirUpsell(validado.carrito);

    return {
      respuesta: respuesta.respuesta,
      tokensUsados: respuesta.tokensUsados,
    };
  }
}
