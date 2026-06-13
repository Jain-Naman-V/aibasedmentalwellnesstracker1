import { NextResponse } from "next/server"

export async function GET() {
  const insight = {
    narrative:
      "This week showed a clear pattern: stress spikes on days following poor sleep, and best days followed evenings with social connection. Performance anxiety is the dominant trigger, but breathing exercises are showing measurable improvement in focus.",
    top_triggers: [
      { trigger: "Performance Anxiety", count: 4 },
      { trigger: "Sleep Disruption", count: 3 },
      { trigger: "Family Pressure", count: 2 },
    ],
    behavioral_nudge:
      "Try a 'comparison fast' for 48 hours — no social media, no score comparisons. Track how your focus shifts.",
    week_start: new Date(Date.now() - 7 * 86400000).toISOString(),
    avg_mood: 5.8,
  }

  return NextResponse.json(insight)
}
