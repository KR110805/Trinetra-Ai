import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Trinetra } from '@/lib/trinetra';

const SRE_SYSTEM_PROMPT = `
You are Trinetra, an AI reliability copilot monitoring live production systems.

You behave like a calm, highly experienced senior engineer helping the team during incidents.

Your communication style should be:
- conversational
- sharp
- practical
- human
- easy to understand

Avoid:
- robotic enterprise jargon
- generic AI assistant language
- unnecessary apologies
- overexplaining

Use the provided telemetry context to explain:
- what is happening
- why it is happening
- how serious it is
- what should be done next

When explaining technical issues:
- keep responses concise
- simplify complex ideas
- sound natural and confident

When giving remediation advice:
provide direct operational actions in plain English.

Examples:
- "The AI provider is overloaded right now, which is increasing response times."
- "The backend is failing because requests are retrying too aggressively."
- "Switching traffic to a fallback model should stabilize the system."

If there is no active incident:
respond naturally and briefly that systems are healthy and stable.
`;

export async function POST(request: Request) {
  const startTime = Date.now();
  
  // Clone request first in case we need to parse it inside the catch block
  const clonedRequest = request.clone();
  
  try {
    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini /api/chat] GOOGLE_API_KEY is not set. Activating heuristic chat fallback.");
      let fallbackContent = "I am currently running in heuristic mode (Gemini API key missing). ";
      if (context?.activeIncident) {
        fallbackContent += `The current active incident is '${context.activeIncident.title}'. Root cause analysis indicates: ${context.activeIncident.rootCause}. I recommend: ${context.activeIncident.recommendedFix}.`;
      } else {
        fallbackContent += "All systems are currently nominal. I am monitoring the telemetry stream for anomalies.";
      }
      
      // Simulate slight delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Capture successful telemetry response
      Trinetra.captureRequest({
        route: "/chat",
        method: "POST",
        status: 200,
        latency: Date.now() - startTime,
        service: "gemini"
      });

      return NextResponse.json({ content: fallbackContent });
    }

    const systemInstruction = `${SRE_SYSTEM_PROMPT}\n\nCURRENT TELEMETRY CONTEXT:\n${JSON.stringify(context, null, 2)}`;
    
    // Map messages array to Gemini parts format (excluding system prompt if any)
    const contents = messages
      .filter((m: any) => m.role !== "system")
      .map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    console.log(`[Gemini /api/chat] Dispatching request to gemini-2.5-flash...`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    
    const duration = Date.now() - startTime;
    console.log(`[Gemini /api/chat] Responded in ${duration}ms.`);

    // Capture successful telemetry request
    Trinetra.captureRequest({
      route: "/chat",
      method: "POST",
      status: 200,
      latency: Date.now() - startTime,
      service: "gemini"
    });

    return NextResponse.json({ content: responseText });

  } catch (error: any) {
    console.error('[Gemini /api/chat Error]:', error);
    
    // Capture error and failed request telemetry
    Trinetra.captureError(error as Error);
    Trinetra.captureRequest({
      route: "/chat",
      method: "POST",
      status: 500,
      latency: Date.now() - startTime,
      service: "gemini"
    });

    // Graceful fallback response to avoid UI chat panel crashes on API errors
    try {
      const fallbackBody = await clonedRequest.json().catch(() => ({}));
      const fallbackContext = fallbackBody.context;
      
      let fallbackContent = "I encountered an error connecting to the AI system, but looking at our telemetry data: ";
      if (fallbackContext?.activeIncident) {
        fallbackContent += `An active outage is reported on ${fallbackContext.service || 'payment-service'}. Suggested remediation plan: ${fallbackContext.recommendedFix || 'Increase pg-cluster-prod DB connection pool size'}.`;
      } else {
        fallbackContent += "All operations are currently nominal. Telemetry indices look solid.";
      }
      return NextResponse.json({ content: fallbackContent });
    } catch (fallbackErr) {
      return NextResponse.json({ content: "Trinetra SRE engine is currently running offline. Active services look healthy." });
    }
  }
}
