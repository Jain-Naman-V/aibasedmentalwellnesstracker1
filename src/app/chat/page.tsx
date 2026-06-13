"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { NavBar } from "@/components/NavBar"
import { ChatInterface } from "@/components/ChatInterface"
import { useChat } from "@/hooks/useChat"
import { getDaysUntilExam, getRecentMoodAverage, getTopTriggers, mockUser } from "@/data/mock-data"

export default function ChatPage() {
  const { messages, sendMessage, streamMessage, isLoading, isStreaming, stopStreaming, clearChat } = useChat()
  const [contextExpanded, setContextExpanded] = useState(false)

  const context = {
    exam_type: mockUser.exam_type || "your exam",
    days_until_exam: getDaysUntilExam(),
    recent_mood_avg: getRecentMoodAverage(),
    recent_triggers: getTopTriggers(),
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <div className="mx-auto w-full max-w-4xl flex-1 flex flex-col px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-bold">AI Companion</h1>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="text-xs text-muted-foreground hover:text-destructive"
                aria-label="Clear chat history"
              >
                Clear
              </button>
              <button
                onClick={() => setContextExpanded(!contextExpanded)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {contextExpanded ? "Hide" : "Show"} context
              </button>
            </div>
          </div>

          {contextExpanded && (
            <div className="mb-4 rounded-lg border bg-muted/30 px-4 py-3 text-xs space-y-1 text-muted-foreground">
              <p>Exam: <span className="font-medium text-foreground">{context.exam_type}</span></p>
              <p>Days until exam: <span className="font-medium text-foreground">{context.days_until_exam}</span></p>
              <p>7-day avg mood: <span className="font-medium text-foreground">{context.recent_mood_avg}/10</span></p>
              <p>Top triggers: <span className="font-medium text-foreground">{context.recent_triggers.join(", ") || "None"}</span></p>
            </div>
          )}

          <ChatInterface
            messages={messages}
            onSend={sendMessage}
            onStream={streamMessage}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onStopStreaming={stopStreaming}
          />
        </div>
        <NavBar />
      </div>
    </AuthGuard>
  )
}
