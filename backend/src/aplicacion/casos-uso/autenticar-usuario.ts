import { RepositorioUsuario } from "../../dominio/interfaces-repositorios/repositorio-usuario";
import { ServicioHash } from "../interfaces-infraestructura/servicio-hash";
import { ServicioToken } from "../interfaces-infraestructura/servicio-token";
import { LoginDto, RegistroDto, RespuestaAutenticacionDto } from "../dtos/dto-autenticacion";
import { NoAutorizado, OperacionInvalida } from "../../dominio/excepciones/indice";

export class AutenticarUsuario {
  constructor(
    private readonly repositorioUsuario: RepositorioUsuario,
    private readonly servicioHash: ServicioHash,
    private readonly servicioToken: ServicioToken
  ) {}

  async login(dto: LoginDto): Promise<RespuestaAutenticacionDto> {
    const usuario = await this.repositorioUsuario.obtenerPorEmail(dto.email);

    if (!usuario) {
      throw new NoAutorizado("Credenciales invalidas");
    }

    if (!usuario.activo) {
      throw new NoAutorizado("Usuario desactivado");
    }

    const claveValida = await this.servicioHash.comparar(dto.clave, usuario.clave);

    if (!claveValida) {
      throw new NoAutorizado("Credenciales invalidas");
    }

    const token = this.servicioToken.generar({
      usuarioId: usuario.id,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async registro(dto: RegistroDto): Promise<RespuestaAutenticacionDto> {
    const usuarioExistente = await this.repositorioUsuario.obtenerPorEmail(dto.email);

    if (usuarioExistente) {
      throw new OperacionInvalida("El email ya esta registrado");
    }

    const claveHasheada = await this.servicioHash.hashear(dto.clave);

    const usuario = await this.repositorioUsuario.crear({
      nombre: dto.nombre,
      email: dto.email,
      clave: claveHasheada,
      rol: dto.rol,
      activo: true,
    });

    const token = this.servicioToken.generar({
      usuarioId: usuario.id,
      rol: usuario.rol,
    });

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}
