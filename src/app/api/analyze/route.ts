import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { safeJsonParse } from '../../../lib/ai/safe-json-parser';

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Valid messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini /api/analyze] GOOGLE_API_KEY is not set. Activating client-side fallback.");
      return NextResponse.json({ error: 'GOOGLE_API_KEY is not set' }, { status: 501 });
    }

    // Map OpenAI style system messages to Gemini systemInstruction and rest to contents
    const systemMessage = messages.find(m => m.role === "system");
    const systemInstruction = systemMessage ? systemMessage.content : undefined;

    const contents = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    console.log(`[Gemini /api/analyze] Dispatching request to gemini-2.5-flash...`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    
    const duration = Date.now() - startTime;
    console.log(`[Gemini /api/analyze] Successfully analyzed in ${duration}ms.`);

    // Clean and validate response text with safeJsonParse
    const parsed = safeJsonParse(responseText);
    const cleanedText = parsed ? JSON.stringify(parsed) : responseText;

    return NextResponse.json({ content: cleanedText });

  } catch (error: any) {
    console.error('[Gemini /api/analyze Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during Gemini analysis' },
      { status: 500 }
    );
  }
}
