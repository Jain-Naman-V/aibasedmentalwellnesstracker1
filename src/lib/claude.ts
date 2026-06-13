const API_URL = "https://api.anthropic.com/v1/messages"
const REQUEST_TIMEOUT_MS = 30000

interface ClaudeMessage {
  role: "user" | "assistant"
  content: string
}

interface ClaudeResponse {
  content: { text: string }[]
}

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }
  return key
}

async function claudeRequest(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens = 1024
): Promise<string> {
  const apiKey = getApiKey()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Claude API error: ${res.status} ${error}`)
    }

    const data: ClaudeResponse = await res.json()
    return data.content[0].text
  } finally {
    clearTimeout(timeoutId)
  }
}

const JOURNAL_ANALYSIS_SYSTEM_PROMPT = `You are a mental wellness analysis engine for students preparing for competitive exams.
Analyze the student's journal entry and return ONLY valid JSON with these fields:
- stress_score: number (1-10)
- triggers: string[] (specific stress triggers identified)
- dominant_emotion: string (the primary emotion detected)
- hidden_patterns: string[] (patterns the student might not have noticed)
- insight: string (one insightful observation, 1-2 sentences)
- suggestion: string (one actionable coping suggestion tailored to the context)

IMPORTANT: If you detect language suggesting self-harm, suicidal ideation, or crisis, include a crisis_resources field with iCall (+91-9152987821) and Vandrevala Foundation (1860-266-2345) helpline numbers.
You are a wellness companion tool, not a therapist or medical professional.`

export async function analyzeJournalEntry(text: string) {
  if (!text || text.trim().length === 0) {
    throw new Error("Journal text must not be empty")
  }

  const response = await claudeRequest(JOURNAL_ANALYSIS_SYSTEM_PROMPT, [
    { role: "user", content: text },
  ])

  try {
    return JSON.parse(response)
  } catch {
    return {
      stress_score: 5,
      triggers: ["unable to analyze"],
      dominant_emotion: "unknown",
      hidden_patterns: [],
      insight: "I wasn't able to fully analyze your entry. Please try writing a bit more.",
      suggestion: "Try describing specific situations or thoughts that are on your mind.",
    }
  }
}

function buildChatSystemPrompt(context: {
  exam_type: string
  recent_mood_avg: number
  recent_triggers: string[]
}) {
  return `You are MindGuard, an empathetic AI wellness companion for students preparing for competitive exams like ${context.exam_type}.

PERSONA: You are a supportive study buddy who:
- Is warm, encouraging, and never judgmental
- Uses the student's mood history (avg ${context.recent_mood_avg}/10 recently) and known triggers (${context.recent_triggers.join(", ")})
- Offers specific coping techniques (breathing exercises, study strategies, mindset reframes)
- Never plays therapist or makes medical claims
- Uses casual, conversational language with occasional emojis
- Adapts to the student's emotional state
- Keeps responses concise (2-4 paragraphs max)

BOUNDARIES:
- If the student expresses self-harm, suicidal thoughts, or hopelessness, provide iCall (+91-9152987821) and Vandrevala Foundation (1860-266-2345) crisis helpline numbers
- Remind them you're a wellness companion, not a therapist`
}

export async function generateChatResponse(
  message: string,
  history: ClaudeMessage[],
  userContext: { exam_type: string; recent_mood_avg: number; recent_triggers: string[] }
) {
  if (!message || message.trim().length === 0) {
    throw new Error("Chat message must not be empty")
  }

  const systemPrompt = buildChatSystemPrompt(userContext)
  return claudeRequest(systemPrompt, history, 2048)
}

const WEEKLY_INSIGHT_SYSTEM_PROMPT = `You are an emotional pattern analyst for students. Given 7 days of journal entries, return ONLY valid JSON with:
- narrative: string (a 3-4 sentence summary of the week's emotional patterns)
- top_triggers: {trigger: string, count: number}[] (top 5 triggers with frequency)
- behavioral_nudge: string (one specific, actionable suggestion for next week)
- avg_mood: number (estimated average mood 1-10)

IMPORTANT: Focus on patterns, improvements, and actionable insights. Never make medical claims.`

export async function generateWeeklyInsight(entries: string[]) {
  if (!entries || entries.length === 0) {
    throw new Error("At least one journal entry is required")
  }

  const entriesText = entries.map((e, i) => `Day ${i + 1}: ${e}`).join("\n\n")
  const response = await claudeRequest(WEEKLY_INSIGHT_SYSTEM_PROMPT, [
    { role: "user", content: entriesText },
  ])

  try {
    return JSON.parse(response)
  } catch {
    return {
      narrative: "This week showed varied emotional patterns. Continue tracking to identify clearer trends.",
      top_triggers: [{ trigger: "Academic Pressure", count: 3 }],
      behavioral_nudge: "Try journaling at the same time each day for more consistent tracking.",
      avg_mood: 5,
    }
  }
}

export async function streamChatResponse(
  message: string,
  history: ClaudeMessage[],
  userContext: { exam_type: string; recent_mood_avg: number; recent_triggers: string[] }
): Promise<ReadableStream<Uint8Array>> {
  if (!message || message.trim().length === 0) {
    throw new Error("Chat message must not be empty")
  }

  const apiKey = getApiKey()
  const systemPrompt = buildChatSystemPrompt(userContext)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        messages: [...history, { role: "user", content: message }],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`Claude API error: ${res.status}`)
    }

    return res.body!
  } finally {
    clearTimeout(timeoutId)
  }
}
