import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { ServicioIa, RespuestaIa } from "../../aplicacion/interfaces-infraestructura/servicio-ia";

export class ServicioIaGemini implements ServicioIa {
  private readonly clienteGemini: GoogleGenerativeAI;
  private readonly prisma: PrismaClient;
  private chunksCacheados: string[] = [];

  constructor(apiKey: string, prisma: PrismaClient) {
    this.clienteGemini = new GoogleGenerativeAI(apiKey);
    this.prisma = prisma;
  }

  async indexarMenu(): Promise<void> {
    const itemsMenu = await this.prisma.itemMenu.findMany({
      where: { disponible: true },
      orderBy: { categoria: "asc" },
    });

    const categorias = this.agruparPorCategoria(itemsMenu);
    this.chunksCacheados = [];

    for (const [categoria, items] of Object.entries(categorias)) {
      const contenido = items
        .map(
          (item) =>
            `${item.nombre}: ${item.descripcion}. Precio: $${item.precio}. Tiempo: ${item.tiempoPreparacion} min.`
        )
        .join("\n");

      this.chunksCacheados.push(`Categoria ${categoria}:\n${contenido}`);
    }
  }

  async consultarMenu(consulta: string, sesionQr: string): Promise<RespuestaIa> {
    if (this.chunksCacheados.length === 0) {
      await this.indexarMenu();
    }

    const chunkRelevantes = this.buscarChunksRelevantes(consulta);
    const historial = await this.obtenerHistorialSesion(sesionQr);
    const prompt = this.construirPrompt(chunkRelevantes, historial, consulta);

    const modelo = this.clienteGemini.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300,
      },
    });

    const resultado = await modelo.generateContent(prompt);
    const respuestaTexto = resultado.response.text();
    const tokensUsados = resultado.response.usageMetadata?.totalTokenCount ?? 0;

    return {
      respuesta: respuestaTexto,
      tokensUsados,
    };
  }

  async sugerirUpsell(carrito: string[]): Promise<RespuestaIa> {
    if (this.chunksCacheados.length === 0) {
      await this.indexarMenu();
    }

    const prompt = [
      "Eres un asistente experto en ventas para mozos en un restaurante de categoría.",
      "El mozo está tomando un pedido. El carrito actual del cliente tiene estos ítems:",
      carrito.map(c => `- ${c}`).join("\n"),
      "",
      "Basado en nuestro menú:",
      this.chunksCacheados.join("\n\n"),
      "",
      "Sugiere 2 opciones concretas y rápidas para venderle ALGO MÁS (upselling o cross-selling), por ejemplo, si tienen carnes ofreceles vino, si no tienen postres ofreceles, si tienen niños bebida infantil, etc.",
      "Sé directo. Da el nombre del plato, la justificación de por qué combina perfecto y el precio.",
      "Mantén la respuesta corta y en un formato que el mozo pueda leer rápido."
    ].join("\n");

    const modelo = this.clienteGemini.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 250,
      },
    });

    const resultado = await modelo.generateContent(prompt);
    return {
      respuesta: resultado.response.text(),
      tokensUsados: resultado.response.usageMetadata?.totalTokenCount ?? 0,
    };
  }

  private buscarChunksRelevantes(consulta: string): string[] {
    const consultaMinusculas = consulta.toLowerCase();
    const puntuados = this.chunksCacheados.map((chunk) => {
      const palabrasConsulta = consultaMinusculas.split(/\s+/);
      const chunkMinusculas = chunk.toLowerCase();
      const coincidencias = palabrasConsulta.filter((palabra) =>
        chunkMinusculas.includes(palabra)
      ).length;
      return { chunk, coincidencias };
    });

    puntuados.sort((a, b) => b.coincidencias - a.coincidencias);

    return puntuados.slice(0, 5).map((item) => item.chunk);
  }

  private async obtenerHistorialSesion(sesionQr: string): Promise<string> {
    const registros = await this.prisma.historialIa.findMany({
      where: { sesionQr },
      orderBy: { creadoEn: "desc" },
      take: 5,
    });

    if (registros.length === 0) {
      return "Sin historial previo";
    }

    return registros
      .reverse()
      .map((registro) => `Pregunta: ${registro.consulta}\nRespuesta: ${registro.respuesta}`)
      .join("\n\n");
  }

  private construirPrompt(
    chunks: string[],
    historial: string,
    consulta: string
  ): string {
    return [
      "Eres un asistente amable de un bar/restaurante. Ayudas a los clientes con el menu.",
      "Responde en espanol, de forma concisa y amigable.",
      "Solo recomienda items que esten en el menu proporcionado.",
      "",
      `Contexto del menu:\n${chunks.join("\n\n")}`,
      "",
      `Historial de la mesa:\n${historial}`,
      "",
      `Pregunta del cliente: ${consulta}`,
    ].join("\n");
  }

  private agruparPorCategoria(
    items: { nombre: string; descripcion: string; precio: unknown; categoria: string; tiempoPreparacion: number }[]
  ): Record<string, typeof items> {
    const grupos: Record<string, typeof items> = {};

    for (const item of items) {
      if (!grupos[item.categoria]) {
        grupos[item.categoria] = [];
      }
      grupos[item.categoria].push(item);
    }

    return grupos;
  }
}
