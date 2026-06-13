import { NextResponse } from "next/server"
import { validateChatMessage, sanitizeText } from "@/lib/validation"
import { generateChatResponse } from "@/lib/claude"
import type { ApiConfig } from "@/lib/api-config"

function crisisResponse(message: string): string | null {
  const lower = message.toLowerCase()
  if (lower.includes("hopeless") || lower.includes("give up") || lower.includes("hurt") || lower.includes("die") || lower.includes("end it")) {
    return "I'm really glad you reached out. What you're feeling matters, and you don't have to face it alone.\n\n" +
      "🧡 iCall Helpline: +91-9152987821\n" +
      "🧡 Vandrevala Foundation: 1860-266-2345 (24/7)\n\n" +
      "These helplines are free, confidential, and available right now. You are important."
  }
  return null
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, apiConfig, context } = body as {
      message: string
      apiConfig?: ApiConfig
      context?: { exam_type: string; recent_mood_avg: number; recent_triggers: string[] }
    }

    const validationError = validateChatMessage(message)
    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }

    const sanitized = sanitizeText(message as string)

    const crisis = crisisResponse(sanitized)
    if (crisis) {
      const encoder = new TextEncoder()
      const words = crisis.split(" ")
      const stream = new ReadableStream({
        async start(controller) {
          for (let i = 0; i < words.length; i++) {
            const prefix = i === 0 ? "" : " "
            controller.enqueue(encoder.encode(prefix + words[i]))
            await new Promise((r) => setTimeout(r, 30 + Math.random() * 20))
          }
          controller.close()
        },
      })
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
        },
      })
    }

    if (apiConfig?.apiKey && apiConfig?.baseUrl) {
      try {
        const ctx = context || { exam_type: "your exam", recent_mood_avg: 5, recent_triggers: [] }
        const response = await generateChatResponse(sanitized, [], ctx, apiConfig)
        const encoder = new TextEncoder()
        const words = response.split(" ")
        const stream = new ReadableStream({
          async start(controller) {
            for (let i = 0; i < words.length; i++) {
              const prefix = i === 0 ? "" : " "
              controller.enqueue(encoder.encode(prefix + words[i]))
              await new Promise((r) => setTimeout(r, 30 + Math.random() * 20))
            }
            controller.close()
          },
        })
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
          },
        })
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "AI request failed"
        console.error("Chat AI error:", errMsg)
        if (errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE")) {
          return NextResponse.json({ error: "This model is currently overloaded. Try a different model in Settings." }, { status: 503 })
        }
        return NextResponse.json({ error: "AI service error. Check your API key and try again." }, { status: 502 })
      }
    }

    const fallback = "I'm glad you reached out. Taking a moment to check in with yourself is one of the healthiest things " +
      "you can do during exam prep.\n\nWhat's been on your mind the most today? Sometimes just saying it out loud " +
      "can make a huge difference."
    const encoder = new TextEncoder()
    const words = fallback.split(" ")
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const prefix = i === 0 ? "" : " "
          controller.enqueue(encoder.encode(prefix + words[i]))
          await new Promise((r) => setTimeout(r, 30 + Math.random() * 20))
        }
        controller.close()
      },
    })
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
