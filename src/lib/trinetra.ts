/**
 * Trinetra Telemetry SDK
 * 
 * A lightweight, production-style observability integration for external
 * applications to stream requests and error telemetry directly into Trinetra.
 */

export interface TrinetraConfig {
  endpoint: string;
}

export interface RequestPayload {
  route: string;
  method: string;
  status: number;
  latency: number;
  service?: string;
}

class TrinetraSDK {
  private endpoint: string | null = null;

  /**
   * Initialize the SDK with configuration options.
   * @param config TrinetraConfig options
   */
  public init(config: TrinetraConfig): void {
    if (!config.endpoint) {
      console.warn("[Trinetra SDK] Initialization failed: 'endpoint' is required.");
      return;
    }
    // Normalize endpoint URL by stripping trailing slash
    this.endpoint = config.endpoint.endsWith('/') ? config.endpoint.slice(0, -1) : config.endpoint;
    console.log(`[Trinetra SDK] Observability pipeline initialized at ${this.endpoint}`);
  }

  /**
   * Log an API request event into the telemetry stream.
   * @param payload Request details
   */
  public async captureRequest(payload: RequestPayload): Promise<void> {
    if (!this.endpoint) {
      console.warn("[Trinetra SDK] captureRequest ignored: SDK is not initialized. Call Trinetra.init() first.");
      return;
    }

    try {
      const telemetryBody = {
        type: "request",
        timestamp: Date.now(),
        method: payload.method.toUpperCase(),
        path: payload.route,
        statusCode: payload.status,
        latencyMs: payload.latency,
        service: payload.service || "external-application"
      };

      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(telemetryBody)
      });
    } catch (err) {
      console.error("[Trinetra SDK Error] Failed to capture request telemetry:", err);
    }
  }

  /**
   * Log an application error event into the telemetry stream.
   * @param error JavaScript error object
   */
  public async captureError(error: Error): Promise<void> {
    if (!this.endpoint) {
      console.warn("[Trinetra SDK] captureError ignored: SDK is not initialized. Call Trinetra.init() first.");
      return;
    }

    try {
      const telemetryBody = {
        type: "error",
        timestamp: Date.now(),
        message: error.message || String(error),
        stack: error.stack || ""
      };

      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(telemetryBody)
      });
    } catch (err) {
      console.error("[Trinetra SDK Error] Failed to capture error telemetry:", err);
    }
  }
}

// Export singleton instance as requested
export const Trinetra = new TrinetraSDK();
