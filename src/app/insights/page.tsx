"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { NavBar } from "@/components/NavBar"
import { mockWeeklyInsight, mockMoodLogs, mockJournalEntries } from "@/data/mock-data"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TriggerCount {
  trigger: string
  count: number
}

export default function InsightsPage() {
  const [triggers, setTriggers] = useState<TriggerCount[]>([])
  const [weekOverWeek, setWeekOverWeek] = useState({ diff: 0, direction: "same" as "up" | "down" | "same" })

  useEffect(() => {
    const triggerMap = new Map<string, number>()
    for (const entry of mockJournalEntries) {
      for (const t of entry.ai_analysis?.triggers ?? []) {
        triggerMap.set(t, (triggerMap.get(t) || 0) + 1)
      }
    }
    setTriggers(
      [...triggerMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([trigger, count]) => ({ trigger, count }))
    )

    const diff = mockWeeklyInsight.avg_mood - mockWeeklyInsight.last_week_avg_mood
    setWeekOverWeek({
      diff: Math.abs(Math.round(diff * 10) / 10),
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "same",
    })
  }, [])

  const chartData = mockMoodLogs.slice(-30).map((log) => ({
    date: new Date(log.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    mood: log.mood,
    tags: log.tags,
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; mood: number; tags: string[] } }> }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-lg">
        <p className="font-medium">{d.date}</p>
        <p>Mood: {d.mood}/10</p>
        {d.tags?.length > 0 && (
          <p className="text-muted-foreground">Tags: {d.tags.join(", ")}</p>
        )}
      </div>
    )
  }

  const DirectionIcon = weekOverWeek.direction === "up"
    ? TrendingUp
    : weekOverWeek.direction === "down"
    ? TrendingDown
    : Minus

  const directionColor = weekOverWeek.direction === "up"
    ? "text-green-500"
    : weekOverWeek.direction === "down"
    ? "text-red-500"
    : "text-muted-foreground"

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        <div className="mx-auto max-w-lg space-y-6 px-4 pt-8">
          <h1 className="text-2xl font-bold">Insights</h1>

          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">30-Day Mood Trend</h2>
            <div className="h-64" role="img" aria-label="Line chart of mood scores over the last 30 days">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[1, 10]} ticks={[1, 3, 5, 7, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "hsl(var(--primary))" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Last week: {mockWeeklyInsight.last_week_avg_mood}
              </span>
              <DirectionIcon className={cn("h-4 w-4", directionColor)} />
              <span className={cn("font-medium", directionColor)}>
                This week: {mockWeeklyInsight.avg_mood}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Top Stress Triggers
            </h2>
            {triggers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No triggers detected yet. Complete more check-ins to see patterns.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {triggers.map((t) => (
                  <div
                    key={t.trigger}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1.5 text-xs font-medium"
                  >
                    <span>{t.trigger}</span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Weekly Narrative
            </h2>
            <p className="text-sm leading-relaxed text-card-foreground/80">
              {mockWeeklyInsight.narrative}
            </p>
            <div className="rounded-lg bg-primary/5 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Try this:</p>
              <p className="text-sm">{mockWeeklyInsight.behavioral_nudge}</p>
            </div>
          </div>
        </div>
        <NavBar />
      </div>
    </AuthGuard>
  )
}
