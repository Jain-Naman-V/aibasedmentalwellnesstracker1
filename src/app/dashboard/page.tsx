"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { NavBar } from "@/components/NavBar"
import { getStreak, getRecentMoodAverage, mockWeeklyInsight } from "@/data/mock-data"
import { Brain, Flame, Sparkles, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

function getMoodColor(avg: number): string {
  if (avg <= 3) return "bg-red-500"
  if (avg <= 5) return "bg-orange-400"
  if (avg <= 7) return "bg-yellow-400"
  return "bg-green-500"
}

function getStreakMilestone(streak: number): { show: boolean; message: string } {
  if (streak === 7) return { show: true, message: "One week of check-ins! You're building a powerful habit 🌟" }
  if (streak === 30) return { show: true, message: "30 days! That's incredible dedication. Your future self is thanking you 💪" }
  return { show: false, message: "" }
}

export default function DashboardPage() {
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [avgMood, setAvgMood] = useState(0)
  const [milestone, setMilestone] = useState<{ show: boolean; message: string }>({ show: false, message: "" })

  useEffect(() => {
    const s = getStreak()
    const a = getRecentMoodAverage()
    setStreak(s)
    setAvgMood(a)
    setMilestone(getStreakMilestone(s))
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-20">
        <div className="mx-auto max-w-lg px-4 pt-8 space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">MindGuard</span>
            </div>
          </header>

          {milestone.show && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{milestone.message}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Streak
              </div>
              <p className="text-3xl font-bold">{streak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <div className={cn("h-2 w-2 rounded-full", getMoodColor(avgMood))} />
                7-day Mood
              </div>
              <p className="text-3xl font-bold">{avgMood} <span className="text-sm font-normal text-muted-foreground">/ 10</span></p>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkin")}
            className="w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 text-left hover:bg-primary/10 transition-colors group"
          >
            <p className="text-sm text-muted-foreground mb-1">Today&apos;s check-in is waiting</p>
            <p className="text-base font-semibold group-hover:text-primary transition-colors">How are you feeling? →</p>
          </button>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Latest Insight
            </div>
            <p className="text-sm leading-relaxed text-card-foreground/80">
              {mockWeeklyInsight.behavioral_nudge}
            </p>
            <button
              onClick={() => router.push("/insights")}
              className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View my patterns <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        <NavBar />
      </div>
    </AuthGuard>
  )
}
