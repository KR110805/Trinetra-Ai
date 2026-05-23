/**
 * Trinetra Telemetry SDK
 * Lightweight, hackathon-friendly client for sending frontend performance,
 * errors, custom metrics, and operational events to Trinetra.
 */

export interface TrinetraConfig {
  apiKey: string;
  projectName: string;
  environment?: string;
  endpoint?: string;
}

export interface RequestTelemetry {
  route: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  status: number;
  latency: number; // in milliseconds
  service: string;
}

export interface ErrorTelemetry {
  message: string;
  stack?: string;
  severity?: "low" | "medium" | "high" | "critical";
  route?: string;
  service?: string;
}

export interface MetricTelemetry {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

export interface EventTelemetry {
  name: string;
  description: string;
  type: "deployment" | "traffic_spike" | "recovery" | "custom";
  metadata?: Record<string, any>;
}

export class TrinetraSDK {
  private config: TrinetraConfig | null = null;

  /**
   * Initializes the Trinetra SDK with your configuration.
   */
  public init(config: TrinetraConfig): void {
    this.config = {
      environment: "production",
      endpoint: "/api/telemetry",
      ...config,
    };
    
    if (typeof window !== "undefined") {
      console.log(`[Trinetra SDK] Initialized for project: ${this.config.projectName}`);
    }
  }

  /**
   * Tracks an HTTP request execution.
   */
  public captureRequest(data: RequestTelemetry): void {
    this.sendTelemetry("request", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Tracks an application exception or error signal.
   */
  public captureError(data: ErrorTelemetry): void {
    this.sendTelemetry("error", {
      ...data,
      severity: data.severity || "high",
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Captures custom numeric metrics (e.g. system usage, user signup ratios).
   */
  public captureMetric(data: MetricTelemetry): void {
    this.sendTelemetry("metric", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Records operational events (e.g. rollouts, automated actions, scale operations).
   */
  public captureEvent(data: EventTelemetry): void {
    this.sendTelemetry("event", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sends telemetry packet to the configured endpoint with automatic backoff retry logic.
   */
  private async sendTelemetry(type: string, data: any): Promise<void> {
    if (!this.config) {
      if (typeof window !== "undefined") {
        console.warn("[Trinetra SDK] capture call ignored. SDK not initialized. Call Trinetra.init() first.");
      }
      return;
    }

    const payload = {
      sdkVersion: "1.0.0",
      apiKey: this.config.apiKey,
      projectName: this.config.projectName,
      environment: this.config.environment,
      type,
      data,
    };

    const url = this.config.endpoint || "/api/telemetry";
    const maxRetries = 3;
    let attempt = 0;
    let delay = 1000;

    const performFetch = async (): Promise<boolean> => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.config?.apiKey}`,
            "X-Trinetra-SDK": "true",
          },
          body: JSON.stringify(payload),
        });
        return response.ok;
      } catch (error) {
        return false;
      }
    };

    // Retry loop with simple exponential backoff
    while (attempt < maxRetries) {
      const success = await performFetch();
      if (success) {
        break;
      }
      
      attempt++;
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // double the delay time
      }
    }
  }
}

// Export singleton instance for direct import/usage
export const Trinetra = new TrinetraSDK();
