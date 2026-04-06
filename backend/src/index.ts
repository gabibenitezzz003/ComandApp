import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { obtenerVariablesEntorno } from "./infraestructura/configuracion/variables-entorno";
import { obtenerClientePrisma, desconectarPrisma } from "./infraestructura/base-datos/conexion-prisma";
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

async function iniciar(): Promise<void> {
  const variables = obtenerVariablesEntorno();
  const prisma = obtenerClientePrisma();
  const aplicacion = express();
  const servidorHttp = createServer(aplicacion);

  const repositorioMesa = new RepositorioMesaPrisma(prisma);
  const repositorioUsuario = new RepositorioUsuarioPrisma(prisma);
  const repositorioItemMenu = new RepositorioItemMenuPrisma(prisma);
  const repositorioComanda = new RepositorioComandaPrisma(prisma);
  const repositorioPago = new RepositorioPagoPrisma(prisma);
  const repositorioHistorialIa = new RepositorioHistorialIaPrisma(prisma);

  const servicioHash = new ServicioHashCrypto();
  const servicioToken = new ServicioTokenJwt(variables.JWT_SECRETO);
  const servicioIa = new ServicioIaGemini(variables.GEMINI_API_KEY, prisma);
  const servicioWebSocket = new ServidorWebSocketImpl(servidorHttp, variables.CORS_ORIGEN);
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

  aplicacion.use(cors({ origin: variables.CORS_ORIGEN }));
  aplicacion.use(express.json());

  aplicacion.use("/api/auth", crearRutasAutenticacion(controladorAuth));
  aplicacion.use("/api/comandas", crearRutasComanda(controladorComanda, middlewareAuth));
  aplicacion.use("/api/pagos", crearRutasPago(controladorPago, middlewareAuth));
  aplicacion.use("/api/menu", crearRutasMenu(controladorMenu, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/mesas", crearRutasMesa(controladorMesa, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/usuarios", crearRutasUsuario(controladorUsuario, middlewareAuth, middlewareRolAdmin));
  aplicacion.use("/api/ia", crearRutasIa(controladorIa));

  aplicacion.use(middlewareErrores);

  await servicioIa.indexarMenu().catch(() => {});

  servidorHttp.listen(variables.PUERTO, "0.0.0.0", () => {
    console.log(`📡 Servidor HTTP/WebSocket escuchando en puerto ${variables.PUERTO}`);
  });

  const apagadoGraceful = async (): Promise<void> => {
    servidorHttp.close();
    await desconectarPrisma();
    process.exit(0);
  };

  process.on("SIGTERM", apagadoGraceful);
  process.on("SIGINT", apagadoGraceful);
}

iniciar()
  .then(() => console.log(`🚀 ComandApp corriendo en puerto ${process.env.PUERTO || 3001}`))
  .catch(() => {
    process.exit(1);
  });
