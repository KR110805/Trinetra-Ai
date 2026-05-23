import { NextResponse } from "next/server";

// Setup global in-memory queue to persist across Next.js dev server hot reloads
const globalForTelemetry = globalThis as unknown as {
  telemetryQueue: any[];
};

if (!globalForTelemetry.telemetryQueue) {
  globalForTelemetry.telemetryQueue = [];
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { apiKey, projectName, type, data } = payload;

    // Minimal validation
    if (!apiKey || !projectName || !type || !data) {
      return NextResponse.json(
        { error: "Invalid telemetry payload structure. Missing required fields." },
        { status: 400 }
      );
    }

    // Append to global queue for dashboard polling
    globalForTelemetry.telemetryQueue.push(payload);

    // Prevent memory leaks by capping the queue size at 500 items
    if (globalForTelemetry.telemetryQueue.length > 500) {
      globalForTelemetry.telemetryQueue.shift();
    }

    // Log the payload on the server terminal for real-time visibility during demos
    console.log(`\x1b[32m[Trinetra Ingestion]\x1b[0m Received \x1b[36m${type.toUpperCase()}\x1b[0m telemetry packet from project: \x1b[35m${projectName}\x1b[0m`);
    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json({
      status: "success",
      message: "Telemetry packet queued successfully",
      packetId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    });

  } catch (error: any) {
    console.error("[Trinetra Ingestion Error]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process telemetry ingestion" },
      { status: 500 }
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
