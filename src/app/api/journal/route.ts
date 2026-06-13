import { NextResponse } from "next/server"
import { analyzeJournalEntry } from "@/lib/claude"
import { validateJournalText, sanitizeText } from "@/lib/validation"
import type { ApiConfig } from "@/lib/api-config"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { raw_text, apiConfig } = body as { raw_text: string; apiConfig?: ApiConfig }

    const validationError = validateJournalText(raw_text)
    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }

    const sanitized = sanitizeText(raw_text as string)

    let analysis
    try {
      analysis = await analyzeJournalEntry(sanitized, apiConfig)
    } catch {
      analysis = {
        stress_score: 5,
        triggers: ["unable to analyze"],
        dominant_emotion: "unknown",
        hidden_patterns: [],
        insight: "Your entry was received but I couldn't analyze it fully. Try describing specific situations.",
        suggestion: "Try writing about a particular moment from your day.",
      }
    }

    return NextResponse.json({
      id: crypto.randomUUID(),
      raw_text: sanitized,
      ai_analysis: analysis,
      stress_score: analysis.stress_score,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    console.error("Journal API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
