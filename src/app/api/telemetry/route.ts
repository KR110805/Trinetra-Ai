import { NextResponse } from "next/server";

// Setup global in-memory queue to persist across Next.js dev server hot reloads
const globalForTelemetry = globalThis as unknown as {
  telemetryQueue: any[];
};

if (!globalForTelemetry.telemetryQueue) {
  globalForTelemetry.telemetryQueue = [];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    const rawPayload = await request.json().catch(() => null);
    
    if (!rawPayload || typeof rawPayload !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const type = rawPayload.type || "request";
    const projectName = rawPayload.projectName || rawPayload.data?.projectName || "External Application";
    const apiKey = rawPayload.apiKey || "trinetra-dev-key";

    // Extract inner data or reconstruct from flat payload fields
    let dataObj = rawPayload.data || {};
    
    // If it's a flat payload, map flat fields to standard data object fields
    if (Object.keys(dataObj).length === 0) {
      dataObj = {
        type: type,
        timestamp: rawPayload.timestamp || Date.now(),
        method: (rawPayload.method || "GET").toUpperCase(),
        route: rawPayload.route || rawPayload.path || "/api",
        status: Number(rawPayload.status !== undefined ? rawPayload.status : (rawPayload.statusCode !== undefined ? rawPayload.statusCode : 200)),
        latency: Number(rawPayload.latency !== undefined ? rawPayload.latency : (rawPayload.latencyMs !== undefined ? rawPayload.latencyMs : 0)),
        service: rawPayload.service || "external-application",
        message: rawPayload.message || rawPayload.error || undefined,
        error: rawPayload.error || rawPayload.message || undefined
      };
    } else {
      // Ensure existing nested data fields have fallback logic
      dataObj = {
        type: dataObj.type || type,
        timestamp: dataObj.timestamp || rawPayload.timestamp || Date.now(),
        method: (dataObj.method || rawPayload.method || "GET").toUpperCase(),
        route: dataObj.route || dataObj.path || rawPayload.route || rawPayload.path || "/api",
        status: Number(dataObj.status !== undefined ? dataObj.status : (dataObj.statusCode !== undefined ? dataObj.statusCode : (rawPayload.status !== undefined ? rawPayload.status : 200))),
        latency: Number(dataObj.latency !== undefined ? dataObj.latency : (dataObj.latencyMs !== undefined ? dataObj.latencyMs : (rawPayload.latency !== undefined ? rawPayload.latency : 0))),
        service: dataObj.service || rawPayload.service || "external-application",
        message: dataObj.message || dataObj.error || rawPayload.message || rawPayload.error || undefined,
        error: dataObj.error || dataObj.message || rawPayload.error || rawPayload.message || undefined
      };
    }

    // Force status to 500 if type is error and status is not error-like
    if (type === "error" && dataObj.status < 400) {
      dataObj.status = 500;
    }

    const normalizedPayload = {
      apiKey,
      projectName,
      type,
      data: dataObj
    };

    // Append to global queue for dashboard polling
    globalForTelemetry.telemetryQueue.push(normalizedPayload);

    // Prevent memory leaks by capping the queue size at 500 items
    if (globalForTelemetry.telemetryQueue.length > 500) {
      globalForTelemetry.telemetryQueue.shift();
    }

    // Log the payload on the server terminal for real-time visibility during demos
    console.log(`\x1b[32m[Trinetra Ingestion]\x1b[0m Received \x1b[36m${type.toUpperCase()}\x1b[0m telemetry packet from project: \x1b[35m${projectName}\x1b[0m`);
    console.log(JSON.stringify(normalizedPayload, null, 2));

    return NextResponse.json(
      {
        status: "success",
        success: true,
        message: "Telemetry packet queued successfully",
        packetId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
      { headers: CORS_HEADERS }
    );

  } catch (error: any) {
    console.error("[Trinetra Ingestion Error]:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to process telemetry ingestion" 
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function GET() {
  try {
    // Return all queued items and clear the queue
    const queue = [...globalForTelemetry.telemetryQueue];
    globalForTelemetry.telemetryQueue = [];
    
    return NextResponse.json(queue);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to retrieve telemetry queue" },
      { status: 500 }
    );
  }
}
