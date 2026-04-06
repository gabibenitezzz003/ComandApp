import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { obtenerVariablesEntorno, obtenerPuerto, obtenerOrigenesCors, obtenerConfigN8n } from "./infraestructura/configuracion/variables-entorno";
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
import { ServicioN8n } from "./infraestructura/apis-externas/servicio-n8n";
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
import { ControladorPublico } from "./presentacion/controladores/controlador-publico";
import { crearRutasComanda } from "./presentacion/rutas/rutas-comanda";
import { crearRutasPago } from "./presentacion/rutas/rutas-pago";
import { crearRutasMenu } from "./presentacion/rutas/rutas-menu";
import { crearRutasMesa } from "./presentacion/rutas/rutas-mesa";
import { crearRutasAutenticacion } from "./presentacion/rutas/rutas-autenticacion";
import { crearRutasIa } from "./presentacion/rutas/rutas-ia";
import { crearRutasUsuario } from "./presentacion/rutas/rutas-usuario";
import { crearRutasAnalytics } from "./presentacion/rutas/rutas-analytics";
import { crearRutasPublicas } from "./presentacion/rutas/rutas-publicas";
import { crearMiddlewareAutenticacion, crearMiddlewareRol } from "./presentacion/middlewares/middleware-autenticacion";
import { middlewareErrores } from "./presentacion/middlewares/middleware-errores";
import { ObtenerAnalytics } from "./aplicacion/casos-uso/obtener-analytics";
import { ControladorAnalytics } from "./presentacion/controladores/controlador-analytics";

function log(level: "info" | "warn" | "error", message: string, data?: Record<string, unknown>) {
  console.log(JSON.stringify({ level, message, timestamp: new Date().toISOString(), ...data }));
}

process.on("uncaughtException", (err) => {
  log("error", "uncaught_exception", { error: String(err), stack: err.stack });
});

process.on("unhandledRejection", (err) => {
  log("error", "unhandled_rejection", { error: String(err) });
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

  const limiterGeneral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas solicitudes. Intenta en unos minutos." },
  });

  const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiados intentos de login. Espera unos minutos." },
  });

  const limiterIa = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas consultas IA. Intenta en unos minutos." },
  });

  aplicacion.use("/api", limiterGeneral);

  aplicacion.use((_req, res, next) => {
    res.setTimeout(20_000, () => {
      if (!res.headersSent) {
        res.status(408).json({ error: "Timeout: la solicitud tardo demasiado." });
      }
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

  // n8n (opcional — opera en silencio si N8N_WEBHOOK_URL no está definida)
  const { webhookUrl: n8nUrl, secret: n8nSecret } = obtenerConfigN8n();
  const servicioN8n = new ServicioN8n(n8nUrl, n8nSecret);

  const casoCrearComanda = new CrearComanda(repositorioComanda, repositorioItemMenu, repositorioMesa, servicioWebSocket, servicioN8n);
  const casoActualizarEstado = new ActualizarEstado(repositorioComanda, servicioEstadoComanda, servicioWebSocket, servicioN8n);
  const casoProcesarPago = new ProcesarPago(repositorioPago, repositorioComanda, servicioEstadoComanda, servicioWebSocket, servicioN8n);
  const casoConsultarIa = new ConsultarIa(servicioIa, repositorioHistorialIa);
  const casoObtenerMenu = new ObtenerMenu(repositorioItemMenu);
  const casoObtenerComandas = new ObtenerComandas(repositorioComanda);
  const casoAutenticar = new AutenticarUsuario(repositorioUsuario, servicioHash, servicioToken);
  const casoGestionarMesas = new GestionarMesas(repositorioMesa);
  const casoListarMozos = new ListarMozos(repositorioUsuario);
  const casoObtenerAnalytics = new ObtenerAnalytics(prisma);

  const controladorComanda = new ControladorComanda(casoCrearComanda, casoActualizarEstado, casoObtenerComandas);
  const controladorPago = new ControladorPago(casoProcesarPago);
  const controladorMenu = new ControladorMenu(casoObtenerMenu, repositorioItemMenu);
  const controladorMesa = new ControladorMesa(casoGestionarMesas);
  const controladorAuth = new ControladorAutenticacion(casoAutenticar);
  const controladorIa = new ControladorIa(casoConsultarIa);
  const controladorUsuario = new ControladorUsuario(casoListarMozos);
  const controladorAnalytics = new ControladorAnalytics(casoObtenerAnalytics);
  const controladorPublico = new ControladorPublico(repositorioMesa, casoCrearComanda, servicioWebSocket);

  const middlewareAuth = crearMiddlewareAutenticacion(servicioToken);
  const middlewareRolAdmin = crearMiddlewareRol("ADMIN");

  aplicacion.use("/api/auth", limiterAuth, crearRutasAutenticacion(controladorAuth));
  aplicacion.use("/api/comandas", crearRutasComanda(controladorComanda, middlewareAuth));
  aplicacion.use("/api/pagos", crearRutasPago(controladorPago, middlewareAuth));
  aplicacion.use("/api/menu", crearRutasMenu(controladorMenu, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/mesas", crearRutasMesa(controladorMesa, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/usuarios", crearRutasUsuario(controladorUsuario, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/ia", limiterIa, crearRutasIa(controladorIa));
  aplicacion.use("/api/analytics", crearRutasAnalytics(controladorAnalytics, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/publico", crearRutasPublicas(controladorPublico));

  aplicacion.use(middlewareErrores);

  setImmediate(() => {
    servicioIa.indexarMenu().catch((e) => {
      console.error("Error indexando menu IA:", e);
    });
  });

  const puerto = obtenerPuerto();
  servidorHttp.listen(puerto, "0.0.0.0", () => {
    log("info", "server_started", { port: puerto, origins: origenes });
  });

  const apagadoGraceful = async (): Promise<void> => {
    log("info", "server_shutting_down");
    servidorHttp.close(async () => {
      await desconectarPrisma();
      process.exit(0);
    });
  };

  process.on("SIGTERM", apagadoGraceful);
  process.on("SIGINT", apagadoGraceful);
}

iniciar().catch((error) => {
  log("error", "startup_failed", { error: String(error), stack: error?.stack });
  process.exit(1);
});
