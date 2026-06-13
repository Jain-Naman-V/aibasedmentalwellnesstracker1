import { NextResponse } from "next/server"
import { validateChatMessage, sanitizeText } from "@/lib/validation"

function buildStreamingResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("hopeless") || lower.includes("give up") || lower.includes("hurt") || lower.includes("die") || lower.includes("end it")) {
    return "I'm really glad you reached out. What you're feeling matters, and you don't have to face it alone.\n\n" +
      "🧡 iCall Helpline: +91-9152987821\n" +
      "🧡 Vandrevala Foundation: 1860-266-2345 (24/7)\n\n" +
      "These helplines are free, confidential, and available right now. You are important."
  }
  if (lower.includes("stress") || lower.includes("anxious") || lower.includes("worried")) {
    return "It sounds like you're carrying a lot right now, and that's completely okay. Exam prep is intense, and your feelings are valid.\n\n" +
      "Let me share a quick technique that might help: the 5-4-3-2-1 grounding exercise. Look around and name " +
      "5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. " +
      "It pulls your brain out of the stress cycle in under a minute."
  }
  return "I'm glad you reached out. Taking a moment to check in with yourself is one of the healthiest things " +
    "you can do during exam prep.\n\nWhat's been on your mind the most today? Sometimes just saying it out loud " +
    "can make a huge difference."
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message } = body

    const validationError = validateChatMessage(message)
    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 400 })
    }

    const sanitized = sanitizeText(message as string)
    const response = buildStreamingResponse(sanitized)
    const encoder = new TextEncoder()
    const words = response.split(" ")

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < words.length; i++) {
            const prefix = i === 0 ? "" : " "
            controller.enqueue(encoder.encode(prefix + words[i]))
            await new Promise((r) => setTimeout(r, 30 + Math.random() * 20))
          }
          controller.close()
        } catch {
          controller.error(new Error("Stream interrupted"))
        }
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
