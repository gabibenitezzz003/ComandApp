import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { obtenerVariablesEntorno, obtenerPuerto, obtenerOrigenesCors } from "./infraestructura/configuracion/variables-entorno";
import { obtenerClientePrisma, conectarConRetry, desconectarPrisma } from "./infraestructura/base-datos/conexion-prisma";
import { RepositorioMesaPrisma } from "./infraestructura/repositorios/repositorio-mesa-prisma";
import { RepositorioUsuarioPrisma } from "./infraestructura/repositorios/repositorio-usuario-prisma";
import { RepositorioItemMenuPrisma } from "./infraestructura/repositorios/repositorio-item-menu-prisma";
import { RepositorioComandaPrisma } from "./infraestructura/repositorios/repositorio-comanda-prisma";
import { RepositorioPagoPrisma } from "./infraestructura/repositorios/repositorio-pago-prisma";
import { RepositorioHistorialIaPrisma } from "./infraestructura/repositorios/repositorio-historial-ia-prisma";
import { ServicioHashCrypto } from "./infraestructura/apis-externas/servicio-hash-crypto";
import { ServicioTokenJwt } from "./infraestructura/apis-externas/servicio-token-jwt";
import { ServicioIaGemini } from "./infraestructura/apis-externas/servicio-ia-gemini";
import { ServidorWebSocketImpl } from "./infraestructura/websockets/servidor-websocket";
import { ServicioEstadoComanda } from "./dominio/servicios-dominio/servicio-estado-comanda";
import { CrearComanda } from "./aplicacion/casos-uso/crear-comanda";
import { ActualizarEstado } from "./aplicacion/casos-uso/actualizar-estado";
import { ProcesarPago } from "./aplicacion/casos-uso/procesar-pago";
import { ConsultarIa } from "./aplicacion/casos-uso/consultar-ia";
import { ObtenerMenu } from "./aplicacion/casos-uso/obtener-menu";
import { ObtenerComandas } from "./aplicacion/casos-uso/obtener-comandas";
import { AutenticarUsuario } from "./aplicacion/casos-uso/autenticar-usuario";
import { GestionarMesas } from "./aplicacion/casos-uso/gestionar-mesas";
import { ListarMozos } from "./aplicacion/casos-uso/listar-mozos";
import { ControladorComanda } from "./presentacion/controladores/controlador-comanda";
import { ControladorPago } from "./presentacion/controladores/controlador-pago";
import { ControladorMenu } from "./presentacion/controladores/controlador-menu";
import { ControladorMesa } from "./presentacion/controladores/controlador-mesa";
import { ControladorAutenticacion } from "./presentacion/controladores/controlador-autenticacion";
import { ControladorIa } from "./presentacion/controladores/controlador-ia";
import { ControladorUsuario } from "./presentacion/controladores/controlador-usuario";
import { crearRutasComanda } from "./presentacion/rutas/rutas-comanda";
import { crearRutasPago } from "./presentacion/rutas/rutas-pago";
import { crearRutasMenu } from "./presentacion/rutas/rutas-menu";
import { crearRutasMesa } from "./presentacion/rutas/rutas-mesa";
import { crearRutasAutenticacion } from "./presentacion/rutas/rutas-autenticacion";
import { crearRutasIa } from "./presentacion/rutas/rutas-ia";
import { crearRutasUsuario } from "./presentacion/rutas/rutas-usuario";
import { crearMiddlewareAutenticacion, crearMiddlewareRol } from "./presentacion/middlewares/middleware-autenticacion";
import { middlewareErrores } from "./presentacion/middlewares/middleware-errores";

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

async function iniciar(): Promise<void> {
  const variables = obtenerVariablesEntorno();

  await conectarConRetry();
  const prisma = obtenerClientePrisma();

  const aplicacion = express();
  const servidorHttp = createServer(aplicacion);

  const origenes = obtenerOrigenesCors(variables.CORS_ORIGEN);
  aplicacion.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || origenes.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("CORS bloqueado"));
      },
    })
  );
  aplicacion.use(express.json());

  aplicacion.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas solicitudes. Intenta en unos minutos." },
  }));

  aplicacion.use((_req, res, next) => {
    res.setTimeout(10_000, () => {
      res.status(408).json({ error: "Timeout: la solicitud tardo demasiado." });
    });
    next();
  });

  aplicacion.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  const repositorioMesa = new RepositorioMesaPrisma(prisma);
  const repositorioUsuario = new RepositorioUsuarioPrisma(prisma);
  const repositorioItemMenu = new RepositorioItemMenuPrisma(prisma);
  const repositorioComanda = new RepositorioComandaPrisma(prisma);
  const repositorioPago = new RepositorioPagoPrisma(prisma);
  const repositorioHistorialIa = new RepositorioHistorialIaPrisma(prisma);

  const servicioHash = new ServicioHashCrypto();
  const servicioToken = new ServicioTokenJwt(variables.JWT_SECRETO);
  const servicioIa = new ServicioIaGemini(variables.GEMINI_API_KEY, prisma);
  const servicioWebSocket = new ServidorWebSocketImpl(servidorHttp, origenes);
  const servicioEstadoComanda = new ServicioEstadoComanda();

  const casoCrearComanda = new CrearComanda(repositorioComanda, repositorioItemMenu, repositorioMesa, servicioWebSocket);
  const casoActualizarEstado = new ActualizarEstado(repositorioComanda, servicioEstadoComanda, servicioWebSocket);
  const casoProcesarPago = new ProcesarPago(repositorioPago, repositorioComanda, servicioEstadoComanda, servicioWebSocket);
  const casoConsultarIa = new ConsultarIa(servicioIa, repositorioHistorialIa);
  const casoObtenerMenu = new ObtenerMenu(repositorioItemMenu);
  const casoObtenerComandas = new ObtenerComandas(repositorioComanda);
  const casoAutenticar = new AutenticarUsuario(repositorioUsuario, servicioHash, servicioToken);
  const casoGestionarMesas = new GestionarMesas(repositorioMesa);
  const casoListarMozos = new ListarMozos(repositorioUsuario);

  const controladorComanda = new ControladorComanda(casoCrearComanda, casoActualizarEstado, casoObtenerComandas);
  const controladorPago = new ControladorPago(casoProcesarPago);
  const controladorMenu = new ControladorMenu(casoObtenerMenu, repositorioItemMenu);
  const controladorMesa = new ControladorMesa(casoGestionarMesas);
  const controladorAuth = new ControladorAutenticacion(casoAutenticar);
  const controladorIa = new ControladorIa(casoConsultarIa);
  const controladorUsuario = new ControladorUsuario(casoListarMozos);

  const middlewareAuth = crearMiddlewareAutenticacion(servicioToken);
  const middlewareRolAdmin = crearMiddlewareRol("ADMIN");

  aplicacion.use("/api/auth", crearRutasAutenticacion(controladorAuth));
  aplicacion.use("/api/comandas", crearRutasComanda(controladorComanda, middlewareAuth));
  aplicacion.use("/api/pagos", crearRutasPago(controladorPago, middlewareAuth));
  aplicacion.use("/api/menu", crearRutasMenu(controladorMenu, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/mesas", crearRutasMesa(controladorMesa, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/usuarios", crearRutasUsuario(controladorUsuario, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/ia", crearRutasIa(controladorIa));

  aplicacion.use(middlewareErrores);

  setImmediate(() => {
    servicioIa.indexarMenu().catch((e) => {
      console.error("Error indexando menu IA:", e);
    });
  });

  const puerto = obtenerPuerto();
  servidorHttp.listen(puerto, "0.0.0.0", () => {
    console.log(`🚀 ComandApp corriendo en puerto ${puerto}`);
  });

  const apagadoGraceful = async (): Promise<void> => {
    console.log("Cerrando servidor...");
    servidorHttp.close(async () => {
      await desconectarPrisma();
      process.exit(0);
    });
  };

  process.on("SIGTERM", apagadoGraceful);
  process.on("SIGINT", apagadoGraceful);
}

iniciar().catch((error) => {
  console.error("Error al iniciar la app:", error);
  process.exit(1);
});
