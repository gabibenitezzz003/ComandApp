import { PrismaClient } from "@prisma/client";

export interface AnalyticsDto {
  resumen: {
    totalFacturado: number;
    totalComandas: number;
    ticketPromedio: number;
    mesaMasRentable: { numero: number; total: number } | null;
  };
  ingresosPorHora: { hora: number; total: number }[];
  topPlatos: { nombre: string; cantidad: number; total: number }[];
  performanceMozos: { nombre: string; comandas: number; total: number }[];
  comandasPorEstado: { estado: string; cantidad: number }[];
}

export class ObtenerAnalytics {
  constructor(private readonly prisma: PrismaClient) {}

  async obtener(desde: Date, hasta: Date): Promise<AnalyticsDto> {
    const [comandas, itemsAgrupados] = await Promise.all([
      this.prisma.comanda.findMany({
        where: { creadoEn: { gte: desde, lte: hasta } },
        include: {
          mesa: { select: { numero: true } },
          mozo: { select: { nombre: true } },
          items: { include: { itemMenu: { select: { nombre: true } } } },
        },
      }),
      this.prisma.itemComanda.findMany({
        where: { comanda: { creadoEn: { gte: desde, lte: hasta } } },
        include: { itemMenu: { select: { nombre: true } } },
      }),
      this.prisma.usuario.findMany({
        where: { rol: "MOZO" },
        select: { id: true, nombre: true },
      }),
    ]);

    // Resumen general
    const totalFacturado = comandas.reduce(
      (acc, c) => acc + Number(c.total),
      0
    );
    const totalComandas = comandas.length;
    const ticketPromedio = totalComandas > 0 ? totalFacturado / totalComandas : 0;

    // Mesa más rentable
    const totalesPorMesa: Record<string, { numero: number; total: number }> = {};
    for (const c of comandas) {
      const key = c.mesaId;
      if (!totalesPorMesa[key]) {
        totalesPorMesa[key] = { numero: c.mesa.numero, total: 0 };
      }
      totalesPorMesa[key].total += Number(c.total);
    }
    const mesaMasRentable =
      Object.values(totalesPorMesa).sort((a, b) => b.total - a.total)[0] ?? null;

    // Ingresos por hora (0-23)
    const mapaHoras: Record<number, number> = {};
    for (let h = 0; h < 24; h++) mapaHoras[h] = 0;
    for (const c of comandas) {
      const hora = new Date(c.creadoEn).getHours();
      mapaHoras[hora] = (mapaHoras[hora] ?? 0) + Number(c.total);
    }
    const ingresosPorHora = Object.entries(mapaHoras).map(([hora, total]) => ({
      hora: Number(hora),
      total,
    }));

    // Top platos
    const mapaPlatos: Record<string, { nombre: string; cantidad: number; total: number }> = {};
    for (const item of itemsAgrupados) {
      const nombre = item.itemMenu.nombre;
      if (!mapaPlatos[nombre]) {
        mapaPlatos[nombre] = { nombre, cantidad: 0, total: 0 };
      }
      mapaPlatos[nombre].cantidad += item.cantidad;
      mapaPlatos[nombre].total += Number(item.precioUnitario) * item.cantidad;
    }
    const topPlatos = Object.values(mapaPlatos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 7);

    // Performance mozos
    const mapaMozos: Record<string, { nombre: string; comandas: number; total: number }> = {};
    for (const c of comandas) {
      const nombre = c.mozo.nombre;
      if (!mapaMozos[c.mozoId]) {
        mapaMozos[c.mozoId] = { nombre, comandas: 0, total: 0 };
      }
      mapaMozos[c.mozoId].comandas += 1;
      mapaMozos[c.mozoId].total += Number(c.total);
    }
    const performanceMozos = Object.values(mapaMozos).sort(
      (a, b) => b.total - a.total
    );

    // Comandas por estado
    const mapaEstados: Record<string, number> = {};
    for (const c of comandas) {
      mapaEstados[c.estado] = (mapaEstados[c.estado] ?? 0) + 1;
    }
    const comandasPorEstado = Object.entries(mapaEstados).map(
      ([estado, cantidad]) => ({ estado, cantidad })
    );

    return {
      resumen: { totalFacturado, totalComandas, ticketPromedio, mesaMasRentable },
      ingresosPorHora,
      topPlatos,
      performanceMozos,
      comandasPorEstado,
    };
  }
}
