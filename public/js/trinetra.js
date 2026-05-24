/**
 * Trinetra Telemetry SDK (Vanilla Browser Edition)
 * Version 1.2.0-beta
 * 
 * Streams real-time frontend requests, errors, and performance metrics
 * directly into the Trinetra AI observability engine.
 */
(function() {
  class TrinetraSDK {
    constructor() {
      this.endpoint = null;
      this.projectName = "External Application";
      this.apiKey = "trinetra-dev-key";
    }

    /**
     * Initialize the Trinetra Telemetry client.
     * @param {Object} config Integration configuration
     * @param {string} config.endpoint The Trinetra telemetry ingestion endpoint
     * @param {string} [config.projectName] Name of the host application
     * @param {string} [config.apiKey] Trinetra project API key
     */
    init(config) {
      if (!config || !config.endpoint) {
        console.warn("[Trinetra SDK] Initialization skipped: 'endpoint' is required.");
        return;
      }
      // Trim trailing slashes from the API URL
      this.endpoint = config.endpoint.endsWith('/') ? config.endpoint.slice(0, -1) : config.endpoint;
      
      if (config.projectName) {
        this.projectName = config.projectName;
      }
      if (config.apiKey) {
        this.apiKey = config.apiKey;
      }
      
      console.log(`%c🟢 Trinetra SDK%c Pipeline listening at ${this.endpoint} [Project: ${this.projectName}]`, "color: #10B981; font-weight: bold;", "color: inherit;");
    }

    /**
     * Capture an API request performance trace.
     * @param {Object} payload Request transaction details
     * @param {string} payload.route Target API route or path
     * @param {string} payload.method HTTP method (GET, POST, etc.)
     * @param {number} payload.status HTTP response status code
     * @param {number} payload.latency Response latency in milliseconds
     * @param {string} [payload.service] Backend or provider name (e.g. gemini)
     */
    async captureRequest(payload) {
      if (!this.endpoint) {
        console.warn("[Trinetra SDK] captureRequest ignored: Call Trinetra.init() first.");
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
            path: payload.route || payload.path || "/api",
            statusCode: Number(payload.status || 200),
            latencyMs: Number(payload.latency || 0),
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
        console.error("[Trinetra SDK Error] Failed to stream request telemetry:", err);
      }
    }

    /**
     * Capture an application runtime exception or promise rejection.
     * @param {Error|Object} error The active error instance
     */
    async captureError(error) {
      if (!this.endpoint) {
        console.warn("[Trinetra SDK] captureError ignored: Call Trinetra.init() first.");
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
        console.error("[Trinetra SDK Error] Failed to stream error telemetry:", err);
      }
    }
  }

  // Register as global singleton instance
  if (typeof window !== "undefined") {
    window.Trinetra = new TrinetraSDK();
  }
})();
