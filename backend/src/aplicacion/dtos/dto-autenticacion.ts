import { RolUsuario } from "../../dominio/entidades/usuario";

export interface LoginDto {
  email: string;
  clave: string;
}

export interface RegistroDto {
  nombre: string;
  email: string;
  clave: string;
  rol: RolUsuario;
}

export interface RespuestaAutenticacionDto {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: RolUsuario;
  };
}
