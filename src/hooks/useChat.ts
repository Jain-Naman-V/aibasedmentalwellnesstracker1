"use client"

import { useState, useCallback, useRef } from "react"
import type { ChatMessage } from "@/types"
import { mockChatHistory } from "@/data/mock-data"

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
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
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

    try {
      const response = getMockResponse(content)
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        user_id: "user-1",
        role: "assistant",
        content: response,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const fallback: ChatMessage = {
        id: `ai-${Date.now()}`,
        user_id: "user-1",
        role: "assistant",
        content: "I'm here to listen. Could you tell me more about what's on your mind?",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

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
      const fullResponse = getMockResponse(content)
      const words = fullResponse.split(" ")

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        user_id: "user-1",
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      for (let i = 0; i < words.length; i++) {
        if (abortRef.current?.signal.aborted) break
        await new Promise((r) => setTimeout(r, 30 + Math.random() * 20))
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + (i === 0 ? "" : " ") + words[i],
            }
          }
          return updated
        })
      }
    } catch {
      // streaming failed silently
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
    }
  }, [isLoading])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setIsLoading(false)
  }, [])

  return {
    messages,
    sendMessage,
    streamMessage,
    stopStreaming,
    isLoading,
    isStreaming,
  }
}
