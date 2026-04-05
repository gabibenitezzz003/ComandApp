import { RespuestaApi } from "../tipos/tipos-comanda";

const URL_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function realizarPeticion<T>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const cabeceras: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opciones.headers,
  };

  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    ...opciones,
    headers: cabeceras,
  });

  const datos: RespuestaApi<T> = await respuesta.json();

  if (!datos.exito) {
    throw new Error(datos.error?.mensaje ?? "Error desconocido");
  }

  return datos.datos;
}

export const clienteApi = {
  get: <T>(ruta: string) => realizarPeticion<T>(ruta),

  post: <T>(ruta: string, cuerpo: unknown) =>
    realizarPeticion<T>(ruta, {
      method: "POST",
      body: JSON.stringify(cuerpo),
    }),

  put: <T>(ruta: string, cuerpo: unknown) =>
    realizarPeticion<T>(ruta, {
      method: "PUT",
      body: JSON.stringify(cuerpo),
    }),

  patch: <T>(ruta: string, cuerpo: unknown) =>
    realizarPeticion<T>(ruta, {
      method: "PATCH",
      body: JSON.stringify(cuerpo),
    }),

  delete: <T>(ruta: string) =>
    realizarPeticion<T>(ruta, { method: "DELETE" }),
};
