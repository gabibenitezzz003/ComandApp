import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generar() {
  const mesa1 = await prisma.mesa.findFirst({ where: { numero: 1 } });
  const mozo = await prisma.usuario.findFirst({ where: { rol: "MOZO" } });
  const burger = await prisma.itemMenu.findFirst({ where: { nombre: { contains: "Hamburguesa" } } }) 
                 || await prisma.itemMenu.findFirst();

  if (mesa1 && mozo && burger) {
    // Red (RECIBIDO)
    await prisma.comanda.create({
      data: {
        mesaId: mesa1.id,
        mozoId: mozo.id,
        estado: "RECIBIDO",
        total: Number(burger.precio) * 2,
        observaciones: "Mock red state with items",
        items: {
            create: [
                {
                    itemMenuId: burger.id,
                    cantidad: 2,
                    precioUnitario: burger.precio
                }
            ]
        }
      }
    });

    // Green (ENTREGADO) on Mesa 2
    const mesa2 = await prisma.mesa.findFirst({ where: { numero: 2 } });
    const bebida = await prisma.itemMenu.findFirst({ where: { categoria: "BEBIDA" } })
                 || burger;

    if(mesa2) {
        await prisma.comanda.create({
        data: {
            mesaId: mesa2.id,
            mozoId: mozo.id,
            estado: "ENTREGADO",
            total: Number(burger.precio) * 2 + Number(bebida.precio) * 3,
            observaciones: "Mock green state with items",
            items: {
                create: [
                    {
                        itemMenuId: burger.id,
                        cantidad: 2,
                        precioUnitario: burger.precio
                    },
                    {
                        itemMenuId: bebida.id,
                        cantidad: 3,
                        precioUnitario: bebida.precio
                    }
                ]
            }
        }
        });
    }

    console.log("Mock comandas con ITEMS reales creadas.");
  }
}

generar().finally(() => prisma.$disconnect());
