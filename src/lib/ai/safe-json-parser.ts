/**
 * Safely parse JSON strings returned by LLMs, handling markdown code fences
 * and other common malformations gracefully.
 */
export function safeJsonParse(text: string) {
  try {
    let cleaned = text
      .replace(/json/g, "")
      .replace(/```/g, "")
      .trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Extract the JSON object from potential surrounding text
      const braceStart = cleaned.indexOf("{");
      const braceEnd = cleaned.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) {
        cleaned = cleaned.slice(braceStart, braceEnd + 1);
        return JSON.parse(cleaned);
      }
      throw e;
    }
  } catch (error) {
    console.error("[Gemini Parser Error]", error);
    return null;
  }
}
