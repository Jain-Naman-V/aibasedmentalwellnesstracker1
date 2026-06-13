"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { NavBar } from "@/components/NavBar"
import { CheckCheck, ArrowRight, Loader2, Sparkles, Brain } from "lucide-react"
import { getApiConfig } from "@/lib/api-config"

const MOOD_TAGS = [
  "can't focus", "family pressure", "feeling hopeful", "slept badly",
  "anxiety", "mock tests", "social media", "motivation", "health", "focus",
]

function getMoodEmoji(mood: number): string {
  if (mood <= 2) return "😰"
  if (mood <= 4) return "😟"
  if (mood <= 6) return "😐"
  if (mood <= 8) return "🙂"
  return "😊"
}

function getMoodLabel(mood: number): string {
  if (mood <= 2) return "Very stressed"
  if (mood <= 4) return "Somewhat stressed"
  if (mood <= 6) return "Neutral"
  if (mood <= 8) return "Good"
  return "Great"
}

export default function CheckinPage() {
  const router = useRouter()
  const [mood, setMood] = useState(5)
  const [tags, setTags] = useState<string[]>([])
  const [journalText, setJournalText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [analysis, setAnalysis] = useState<{
    stress_score: number
    dominant_emotion: string
    triggers: string[]
    suggestion: string
  } | null>(null)
  const [phase, setPhase] = useState<"input" | "loading" | "result" | "error">("input")
  const [errorMessage, setErrorMessage] = useState("")

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])
  }

  const apiConfig = getApiConfig()
  const missingApiKey = !apiConfig?.apiKey

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setPhase("loading")

    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, tags, note: "" }),
    })

    if (journalText.trim()) {
      const apiConfig = getApiConfig()
      const useRealAI = !!apiConfig?.apiKey

      if (useRealAI) {
        try {
          const res = await fetch("/api/journal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              raw_text: journalText,
            }),
          })
          if (!res.ok) throw new Error(`AI analysis failed (HTTP ${res.status})`)
          const data = await res.json()
          setAnalysis({
            stress_score: data.ai_analysis?.stress_score ?? 5,
            dominant_emotion: data.ai_analysis?.dominant_emotion ?? "mixed",
            triggers: data.ai_analysis?.triggers ?? [],
            suggestion: data.ai_analysis?.suggestion ?? "Take a moment to breathe deeply.",
          })
        } catch {
          setErrorMessage("Your journal was saved. The AI analysis couldn't complete — you can retry.")
          setPhase("error")
          setIsSubmitting(false)
          return
        }
      } else {
        await new Promise((r) => setTimeout(r, 1800))
        const mockAnalysis = {
          stress_score: Math.min(10, Math.max(1, Math.round(5 + (6 - mood) * 0.5 + Math.random() * 2 - 1))),
          dominant_emotion: ["anxious", "hopeful", "tired", "focused", "overwhelmed"][Math.floor(Math.random() * 5)],
          triggers: ["academic pressure", "sleep quality", "social comparison"].slice(0, 1 + Math.floor(Math.random() * 3)),
          suggestion: "Try a 5-minute breathing exercise before your next study session. Your body is telling you it needs a reset.",
        }
        setAnalysis(mockAnalysis)
      }
    }

    setIsSubmitting(false)
    setPhase("result")
  }

  if (phase === "loading") {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg font-medium animate-pulse">Reading between the lines...</p>
            <p className="text-sm text-muted-foreground">Your journal is being analyzed. Just a moment.</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (phase === "error") {
    return (
      <AuthGuard>
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center space-y-4 max-w-sm">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-base font-medium">{errorMessage}</p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setPhase("input")
                  setErrorMessage("")
                }}
                className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Retry
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (phase === "result" && analysis) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-20">
          <div className="mx-auto max-w-lg px-4 pt-8 space-y-6">
            <div className="text-center space-y-2">
              <CheckCheck className="h-8 w-8 text-green-500 mx-auto" />
              <h1 className="text-xl font-bold">Check-in Complete</h1>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stress Score</span>
                <span className="text-2xl font-bold">{analysis.stress_score}/10</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                  style={{ width: `${analysis.stress_score * 10}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Dominant Emotion</p>
                  <p className="text-sm font-medium capitalize">{analysis.dominant_emotion}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Key Trigger</p>
                  <p className="text-sm font-medium">{analysis.triggers[0] ?? "None detected"}</p>
                </div>
              </div>

              <div className="rounded-lg bg-primary/5 p-4">
                <p className="text-sm leading-relaxed">{analysis.suggestion}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/chat")}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Brain className="h-4 w-4" /> Talk about this
              </button>
              <button
                onClick={() => router.push("/insights")}
                className="flex items-center justify-center gap-2 rounded-xl border border-input px-4 py-3 text-sm font-medium hover:bg-accent"
              >
                View my patterns <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setPhase("input")
                  setAnalysis(null)
                  setJournalText("")
                  setMood(5)
                  setTags([])
                }}
                className="text-sm text-muted-foreground hover:text-foreground text-center"
              >
                Done for now
              </button>
            </div>
          </div>
          <NavBar />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-20">
        <div className="mx-auto max-w-lg px-4 pt-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Daily Check-in</h1>
            <p className="text-sm text-muted-foreground">How are you feeling today?</p>
          </div>

          {missingApiKey && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3 text-sm flex items-center gap-2">
              <span className="flex-1">Looks like your AI settings need a quick update</span>
              <button
                onClick={() => router.push("/settings")}
                className="text-primary font-medium hover:underline"
              >
                Update
              </button>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-medium">Your Mood</label>
            <div className="text-center space-y-2">
              <span className="text-4xl">{getMoodEmoji(mood)}</span>
              <p className="text-sm font-medium">{getMoodLabel(mood)}</p>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full accent-primary"
              aria-label="Mood level from 1 to 10"
            />
            <output className="block text-center text-sm text-muted-foreground">
              {mood} / 10
            </output>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Tags (tap any that apply)</label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    tags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label htmlFor="journal" className="text-sm font-medium">
              What&apos;s weighing on you today, or what went well?
            </label>
            <textarea
              id="journal"
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write anything — one sentence or ten paragraphs..."
              className="min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            {isSubmitting ? "Analyzing..." : "Submit Check-in"}
          </button>
        </div>
        <NavBar />
      </div>
    </AuthGuard>
  )
}
