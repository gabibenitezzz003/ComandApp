import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashearClave(texto: string): string {
  const sal = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(sal + texto)
    .digest("hex");
  return `${sal}:${hash}`;
}

async function principal() {
  await prisma.historialIa.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.itemComanda.deleteMany();
  await prisma.comanda.deleteMany();
  await prisma.itemMenu.deleteMany();
  await prisma.mesa.deleteMany();
  await prisma.usuario.deleteMany();

  await prisma.usuario.create({
    data: {
      nombre: "Administrador",
      email: "admin@comandapp.com",
      clave: hashearClave("admin123"),
      rol: "ADMIN",
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      id: "00000000-0000-0000-0000-000000000001",
      nombre: "Carlos Mozo",
      email: "carlos@comandapp.com",
      clave: hashearClave("mozo123"),
      rol: "MOZO",
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre: "Maria Moza",
      email: "maria@comandapp.com",
      clave: hashearClave("mozo123"),
      rol: "MOZO",
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      nombre: "Pedro Cocina",
      email: "pedro@comandapp.com",
      clave: hashearClave("cocina123"),
      rol: "COCINA",
      activo: true,
    },
  });

  await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.mesa.create({
        data: {
          numero: i + 1,
          capacidad: i < 5 ? 4 : 6,
          activa: true,
        },
      })
    )
  );

  await prisma.itemMenu.createMany({
    data: [
      {
        nombre: "Empanadas de Carne",
        descripcion: "6 empanadas de carne cortada a cuchillo con chimichurri",
        precio: 4500,
        categoria: "ENTRADA",
        disponible: true,
        tiempoPreparacion: 15,
      },
      {
        nombre: "Provoleta",
        descripcion: "Provolone fundido con oregano y tomate",
        precio: 3800,
        categoria: "ENTRADA",
        disponible: true,
        tiempoPreparacion: 12,
      },
      {
        nombre: "Tabla de Fiambres",
        descripcion: "Seleccion de jamon crudo, salame, quesos y aceitunas",
        precio: 6200,
        categoria: "ENTRADA",
        disponible: true,
        tiempoPreparacion: 10,
      },
      {
        nombre: "Bife de Chorizo",
        descripcion: "Corte de 400g a la parrilla con guarnicion a eleccion",
        precio: 9800,
        categoria: "PLATO_PRINCIPAL",
        disponible: true,
        tiempoPreparacion: 25,
      },
      {
        nombre: "Milanesa Napolitana",
        descripcion: "Milanesa con salsa de tomate, jamon y mozzarella con papas fritas",
        precio: 7500,
        categoria: "PLATO_PRINCIPAL",
        disponible: true,
        tiempoPreparacion: 20,
      },
      {
        nombre: "Pasta del Dia",
        descripcion: "Tagliatelle casero con salsa bolognesa o crema",
        precio: 6800,
        categoria: "PLATO_PRINCIPAL",
        disponible: true,
        tiempoPreparacion: 18,
      },
      {
        nombre: "Salmon a la Plancha",
        descripcion: "Filete de salmon con ensalada fresca y limon",
        precio: 11200,
        categoria: "PLATO_PRINCIPAL",
        disponible: true,
        tiempoPreparacion: 22,
      },
      {
        nombre: "Flan Casero",
        descripcion: "Flan con dulce de leche y crema",
        precio: 3200,
        categoria: "POSTRE",
        disponible: true,
        tiempoPreparacion: 5,
      },
      {
        nombre: "Tiramissu",
        descripcion: "Tiramissu tradicional italiano",
        precio: 3800,
        categoria: "POSTRE",
        disponible: true,
        tiempoPreparacion: 5,
      },
      {
        nombre: "Cerveza Artesanal IPA",
        descripcion: "Pinta de cerveza artesanal IPA local",
        precio: 2800,
        categoria: "BEBIDA",
        disponible: true,
        tiempoPreparacion: 2,
      },
      {
        nombre: "Vino Malbec",
        descripcion: "Copa de Malbec mendocino reserva",
        precio: 3500,
        categoria: "BEBIDA",
        disponible: true,
        tiempoPreparacion: 2,
      },
      {
        nombre: "Agua Mineral",
        descripcion: "Botella de agua mineral 500ml",
        precio: 1200,
        categoria: "BEBIDA",
        disponible: true,
        tiempoPreparacion: 1,
      },
      {
        nombre: "Limonada",
        descripcion: "Limonada natural con menta y jengibre",
        precio: 2200,
        categoria: "BEBIDA",
        disponible: true,
        tiempoPreparacion: 5,
      },
      {
        nombre: "Papas Bravas",
        descripcion: "Papas fritas con salsa brava picante y alioli",
        precio: 3000,
        categoria: "SNACK",
        disponible: true,
        tiempoPreparacion: 12,
      },
      {
        nombre: "Nachos con Guacamole",
        descripcion: "Nachos crujientes con guacamole fresco y queso cheddar",
        precio: 3500,
        categoria: "SNACK",
        disponible: true,
        tiempoPreparacion: 10,
      },
    ],
  });

  process.exit(0);
}

principal().catch(() => {
  process.exit(1);
});
