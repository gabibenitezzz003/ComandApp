/**
 * ServicioN8n — Dispara eventos asíncronos a n8n para automatizaciones.
 * 
 * Si N8N_WEBHOOK_URL no está definida, el servicio opera en modo silencioso
 * y ComandApp funciona exactamente igual. Sin impacto en producción.
 */

export type EventoN8n =
  | "comanda.nueva"
  | "comanda.estado_cambiado"
  | "comanda.pagada"
  | "comanda.incidencia"
  | "cliente.llamado";

export interface PayloadComandaNueva {
  evento: "comanda.nueva";
  timestamp: string;
  mesa: number;
  mozoNombre: string;
  total: number;
  items: { nombre: string; cantidad: number; subtotal: number }[];
  observaciones: string | null;
}

export interface PayloadEstadoCambiado {
  evento: "comanda.estado_cambiado";
  timestamp: string;
  comandaId: string;
  estadoAnterior: string;
  estadoNuevo: string;
  mesa?: number;
}

export interface PayloadPagada {
  evento: "comanda.pagada";
  timestamp: string;
  comandaId: string;
  monto: number;
  metodo: string;
}

export interface PayloadIncidencia {
  evento: "comanda.incidencia";
  timestamp: string;
  comandaId: string;
  mesa?: number;
  mozoNombre?: string;
}

export interface PayloadLlamado {
  evento: "cliente.llamado";
  timestamp: string;
  mesa?: number;
  tipo: string; // "mozo" | "cuenta"
}

export type PayloadN8n =
  | PayloadComandaNueva
  | PayloadEstadoCambiado
  | PayloadPagada
  | PayloadIncidencia
  | PayloadLlamado;

export class ServicioN8n {
  private readonly webhookUrl: string | null;
  private readonly secret: string | null;
  private readonly habilitado: boolean;

  constructor(webhookUrl?: string, secret?: string) {
    this.webhookUrl = webhookUrl ?? null;
    this.secret = secret ?? null;
    this.habilitado = !!webhookUrl;

    if (this.habilitado) {
      console.log("[n8n] Servicio de automatizaciones activo ✓");
    }
  }

  /**
   * Dispara un evento hacia n8n de forma completamente asíncrona.
   * Nunca lanza errores — si n8n falla, ComandApp sigue funcionando.
   */
  disparar(payload: PayloadN8n): void {
    if (!this.habilitado || !this.webhookUrl) return;

    const url = this.webhookUrl;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.secret) {
      headers["x-n8n-secret"] = this.secret;
    }

    // Fire-and-forget: no await, no bloqueo del flujo principal
    fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // timeout 5s
    })
      .then((res) => {
        if (!res.ok) {
          console.warn(`[n8n] Webhook respondió ${res.status} para evento: ${payload.evento}`);
        }
      })
      .catch((err) => {
        console.warn(`[n8n] Error al disparar evento ${payload.evento}:`, err instanceof Error ? err.message : err);
      });
  }

  get estaHabilitado(): boolean {
    return this.habilitado;
  }
}
