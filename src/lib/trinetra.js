/**
 * Trinetra Telemetry SDK (Javascript version)
 * 
 * A lightweight, production-style observability integration for external
 * applications to stream requests and error telemetry directly into Trinetra.
 */

class TrinetraSDK {
  constructor() {
    this.endpoint = null;
    this.projectName = "Trinetra Dashboard";
    this.apiKey = "trinetra-dev-key";
  }

  /**
   * Initialize the SDK with configuration options.
   * @param {Object} config TrinetraConfig options
   * @param {string} config.endpoint Ingestion endpoint
   * @param {string} [config.projectName] Project name
   * @param {string} [config.apiKey] API key
   */
  init(config) {
    if (!config || !config.endpoint) {
      console.warn("[Trinetra SDK] Initialization failed: 'endpoint' is required.");
      return;
    }
    // Normalize endpoint URL by stripping trailing slash
    this.endpoint = config.endpoint.endsWith('/') ? config.endpoint.slice(0, -1) : config.endpoint;
    
    if (config.projectName) {
      this.projectName = config.projectName;
    }
    if (config.apiKey) {
      this.apiKey = config.apiKey;
    }
    
    console.log(`[Trinetra SDK] Observability pipeline initialized at ${this.endpoint} for project: ${this.projectName}`);
  }

  /**
   * Log an API request event into the telemetry stream.
   * @param {Object} payload Request details
   * @param {string} payload.route
   * @param {string} payload.method
   * @param {number} payload.status
   * @param {number} payload.latency
   * @param {string} [payload.service]
   * @param {string} [payload.projectName]
   */
  async captureRequest(payload) {
    if (!this.endpoint) {
      console.warn("[Trinetra SDK] captureRequest ignored: SDK is not initialized. Call Trinetra.init() first.");
      return;
    }

    try {
      const activeProjectName = payload.projectName || this.projectName;
      const telemetryBody = {
        apiKey: this.apiKey,
        projectName: activeProjectName,
        type: "request",
        data: {
          type: "request",
          timestamp: Date.now(),
          method: (payload.method || "GET").toUpperCase(),
          path: payload.route,
          statusCode: payload.status,
          latencyMs: payload.latency,
          service: payload.service || "external-application"
        }
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
   * @param {Error|Object} error JavaScript error object
   */
  async captureError(error) {
    if (!this.endpoint) {
      console.warn("[Trinetra SDK] captureError ignored: SDK is not initialized. Call Trinetra.init() first.");
      return;
    }

    try {
      const telemetryBody = {
        apiKey: this.apiKey,
        projectName: this.projectName,
        type: "error",
        data: {
          type: "error",
          timestamp: Date.now(),
          message: error.message || String(error),
          stack: error.stack || ""
        }
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
