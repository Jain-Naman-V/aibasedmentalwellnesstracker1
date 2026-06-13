"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ChatMessage } from "@/types"
import { mockChatHistory, getRecentMoodAverage, getTopTriggers } from "@/data/mock-data"
import { getApiConfig } from "@/lib/api-config"

const STORAGE_KEY = "mindguard-chat-history"

function loadMessages(): ChatMessage[] {
  if (typeof window === "undefined") return mockChatHistory
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return mockChatHistory
}

function saveMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {}
}

function getMockResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()
  if (lower.includes("fail") || lower.includes("not good") || lower.includes("stressed") || lower.includes("anxious")) {
    return "I hear you. That pressure is real, especially with exams coming up. But here's the thing — one tough day doesn't define your journey. Can I share a quick grounding exercise? Close your eyes and name 5 things you can see around you right now. It sounds simple, but it pulls your brain out of the stress spiral. Want to try it together? 🧘"
  }
  if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted")) {
    return "Sleep is actually one of your strongest study tools — your brain consolidates memory while you rest. If you're lying awake with racing thoughts, try the 4-7-8 technique: breathe in for 4 seconds, hold for 7, exhale for 8. It activates your parasympathetic nervous system. I do this myself before big presentations! 🌙"
  }
  if (lower.includes("happy") || lower.includes("good") || lower.includes("great") || lower.includes("improve")) {
    return "That's awesome! 🎉 Celebrating wins — even small ones — builds momentum. What do you think made the difference today? Identifying what works is just as important as fixing what doesn't. Let's figure out how to replicate this tomorrow!"
  }
  if (lower.includes("friend") || lower.includes("compare") || lower.includes("others") || lower.includes("instagram")) {
    return "Comparison is so tempting, especially with social media showing everyone's highlight reels. But here's what I've seen in your journal: YOU improved 30 points last week. That's real and that's yours. The only comparison that matters is you vs. you from last month. Keep your eyes on your own paper 📝"
  }
  if (lower.includes("hopeless") || lower.includes("give up") || lower.includes("hurt") || lower.includes("die") || lower.includes("end it")) {
    return "I'm really glad you shared that with me. What you're feeling matters, and you don't have to go through it alone. Please reach out to professional support who can help right now:\n\n🧡 iCall Helpline: +91-9152987821 (available daily)\n🧡 Vandrevala Foundation: 1860-266-2345 (24/7)\n\nYou are important, and this feeling — as heavy as it is right now — won't last forever. Please talk to someone on these helplines. They're free, confidential, and they truly care. I'm here for you too, always."
  }
  return "That's really helpful to share. I'm glad you're opening up — that alone is a big step for your wellbeing. 🧠\n\nHere's a thought: exams test what you know, but they don't test your worth as a person. Your best is always enough, and showing up every day is already a victory. What's one small thing I can help you with right now?"
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  const streamMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      user_id: "user-1",
      role: "user",
      content,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsStreaming(true)

    abortRef.current = new AbortController()

    try {
      const apiConfig = getApiConfig()

      if (apiConfig?.apiKey && apiConfig?.baseUrl) {
        const context = {
          exam_type: "NEET",
          recent_mood_avg: getRecentMoodAverage(),
          recent_triggers: getTopTriggers().slice(0, 3),
        }

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content, apiConfig, context }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }))
          throw new Error(err.error || `HTTP ${res.status}`)
        }

        const reader = res.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        const assistantId = `ai-${Date.now()}`

        setMessages((prev) => [
          ...prev,
          { id: assistantId, user_id: "user-1", role: "assistant", content: "", created_at: new Date().toISOString() },
        ])

        let buffer = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (abortRef.current?.signal.aborted) break
          buffer += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: buffer }
            }
            return updated
          })
        }
      } else {
        const response = getMockResponse(content)
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))

        setMessages((prev) => [
          ...prev,
          { id: `ai-${Date.now()}`, user_id: "user-1", role: "assistant", content: response, created_at: new Date().toISOString() },
        ])
      }
    } catch (err) {
      if (abortRef.current?.signal.aborted) return
      const errMsg = err instanceof Error ? err.message : "AI request failed"
      let fallbackContent = "I'm here to listen. Could you tell me more about what's on your mind?"
      if (errMsg.includes("503") || errMsg.includes("overloaded")) {
        fallbackContent = "⚠️ **Model overloaded.** That model is experiencing high demand right now.\n\nGo to **Settings → API Configuration** and try a different model (e.g. `claude-sonnet-4-20250514` → `claude-3-haiku-20240307` or `gpt-4o-mini`)."
      }
      const fallback: ChatMessage = {
        id: `ai-${Date.now()}`,
        user_id: "user-1",
        role: "assistant",
        content: fallbackContent,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [isLoading])

  const sendMessage = useCallback(async (content: string) => {
    return streamMessage(content)
  }, [streamMessage])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setIsLoading(false)
  }, [])

  const clearChat = useCallback(() => {
    setMessages(mockChatHistory)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    messages,
    sendMessage,
    streamMessage,
    stopStreaming,
    clearChat,
    isLoading,
    isStreaming,
  }
}
