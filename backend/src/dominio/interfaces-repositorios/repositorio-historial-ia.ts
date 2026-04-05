import { HistorialIa } from "../entidades/historial-ia";

export interface CrearHistorialIaDatos {
  sesionQr: string;
  consulta: string;
  respuesta: string;
  tokensUsados: number;
  contexto: string;
}

export interface RepositorioHistorialIa {
  crear(datos: CrearHistorialIaDatos): Promise<HistorialIa>;
  obtenerPorSesion(sesionQr: string): Promise<HistorialIa[]>;
  obtenerTokensTotalesPorSesion(sesionQr: string): Promise<number>;
}
