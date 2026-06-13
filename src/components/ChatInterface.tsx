"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, Bot, User, Square, Loader2 } from "lucide-react"
import type { ChatMessage } from "@/types"
import { formatMarkdown } from "@/lib/markdown"

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
  onStream?: (message: string) => void
  isLoading: boolean
  isStreaming?: boolean
  onStopStreaming?: () => void
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user"
  return (
    <div
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
      role="listitem"
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted/50 text-foreground rounded-bl-md border border-border/50"
        )}
        role="article"
        aria-label={isUser ? "Your message" : "MindGuard response"}
      >
        {isUser ? message.content : formatMarkdown(message.content)}
      </div>
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <User className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  )
}

export function ChatInterface({
  messages,
  onSend,
  onStream,
  isLoading,
  isStreaming = false,
  onStopStreaming,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    if (onStream) {
      onStream(input.trim())
    } else {
      onSend(input.trim())
    }
    setInput("")
    inputRef.current?.focus()
  }

  return (
    <section className="flex h-full flex-col" aria-label="AI Companion Chat">
      <div
        className="flex-1 overflow-y-auto space-y-4 px-1 py-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div role="list" className="space-y-4">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </div>
        {isLoading && !isStreaming && (
          <div className="flex gap-3" aria-label="Loading response">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" aria-hidden="true" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-muted/50 border border-border/50 px-4 py-3">
              <div className="flex gap-1" aria-hidden="true">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
              </div>
              <span className="sr-only">MindGuard is typing...</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border/50 bg-background p-3">
        <form onSubmit={handleSubmit} className="flex gap-2" role="form" aria-label="Chat message form">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what's on your mind..."
            disabled={isLoading}
            aria-label="Type your message"
            aria-describedby="chat-input-hint"
            className={cn(
              "flex-1 rounded-xl border border-input bg-muted/30 px-4 py-2.5 text-sm",
              "placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all disabled:opacity-50"
            )}
          />
          <span id="chat-input-hint" className="sr-only">
            Type your message and press Enter or the send button to chat with MindGuard
          </span>
          {isStreaming && onStopStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="inline-flex items-center justify-center rounded-xl bg-destructive/10 p-2.5 text-destructive hover:bg-destructive/20 transition-colors"
              aria-label="Stop generating response"
            >
              <Square className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-primary p-2.5 text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          )}
        </form>
      </div>
    </section>
  )
}
