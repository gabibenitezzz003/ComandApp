export type RolUsuario = "ADMIN" | "MOZO" | "COCINA";

export class Usuario {
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
  readonly clave: string;
  readonly rol: RolUsuario;
  readonly activo: boolean;
  readonly creadoEn: Date;

  constructor(parametros: {
    id: string;
    nombre: string;
    email: string;
    clave: string;
    rol: RolUsuario;
    activo: boolean;
    creadoEn: Date;
  }) {
    this.id = parametros.id;
    this.nombre = parametros.nombre;
    this.email = parametros.email;
    this.clave = parametros.clave;
    this.rol = parametros.rol;
    this.activo = parametros.activo;
    this.creadoEn = parametros.creadoEn;
  }
}
