import type { MoodLog, JournalEntry, ChatMessage, WeeklyInsight, UserProfile } from "@/types"

export const mockUser: UserProfile = {
  id: "user-1",
  exam_type: "NEET",
  exam_date: "2026-05-03",
  study_hours: 8,
  biggest_fear: "Letting my parents down after all their sacrifices",
  days_until_exam: Math.ceil((new Date("2026-05-03").getTime() - Date.now()) / 86400000),
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
}

export const mockMoodLogs: MoodLog[] = Array.from({ length: 30 }, (_, i) => ({
  id: `mood-${i}`,
  user_id: "user-1",
  mood: Math.max(1, Math.min(10, Math.round(5 + Math.sin(i * 0.5) * 2.5 + (Math.random() - 0.5) * 1.5))),
  tags: [
    ["can't focus", "family pressure", "feeling hopeful", "slept badly", "anxiety"][i % 5],
    ["mock tests", "focus", "social media", "health", "motivation"][i % 5],
  ].filter(Boolean),
  note: "",
  created_at: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
}))

export const mockJournalEntries: JournalEntry[] = [
  {
    id: "entry-1",
    user_id: "user-1",
    raw_text: "Failed my NEET mock again. Scored 580 when I need 650+. Can't sleep properly, keep thinking about my parents' expectations. They've sacrificed so much for my coaching fees. What if I let them down? My chest feels tight every time I open a biology textbook.",
    ai_analysis: {
      stress_score: 8,
      triggers: ["performance anxiety", "family pressure", "sleep disruption", "self-doubt"],
      dominant_emotion: "fear",
      hidden_patterns: ["somatic symptoms manifesting as chest tightness during specific subjects", "catastrophic thinking spiral tied to parental expectations"],
      insight: "Your stress is physically manifesting when studying Biology specifically. The chest tightness is a somatic stress response linked to the pressure you feel about NEET — not a reflection of your actual ability.",
      suggestion: "Try a 4-7-8 breathing exercise before opening your textbook tonight. It activates the parasympathetic nervous system and can reduce that physical tightness within 2 minutes.",
    },
    stress_score: 8,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "entry-2",
    user_id: "user-1",
    raw_text: "Studied 10 hours today. Physics went well but Chemistry is still a mess. I feel like no matter how much I study, there's always someone who has studied more. Saw my friend post her mock score on Instagram and she got 640. I'm happy for her but it also makes me feel like I'm falling behind.",
    ai_analysis: {
      stress_score: 6,
      triggers: ["social comparison", "chemistry anxiety", "impostor feelings", "competition stress"],
      dominant_emotion: "insecurity",
      hidden_patterns: ["external validation seeking through comparison with peers", "discounting own progress despite 10-hour study day"],
      insight: "You studied 10 hours and Physics went well — that's real progress. But comparison on social media is stealing your sense of achievement. Your brain fixates on the one person ahead instead of the hundreds you've surpassed.",
      suggestion: "Take a 48-hour social media detox before your next mock. Compare your score this week to your score last week, not to anyone else's.",
    },
    stress_score: 6,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "entry-3",
    user_id: "user-1",
    raw_text: "Can't focus at all today. Opened my book 4 hours ago and I'm still on the same page. Mind keeps wandering to what will happen if I don't clear NEET. Will I be a failure? What will I tell everyone? I feel exhausted but I can't sleep either. Just stuck in this loop.",
    ai_analysis: {
      stress_score: 9,
      triggers: ["focus issues", "catastrophic thinking", "rumination", "exhaustion"],
      dominant_emotion: "hopelessness",
      hidden_patterns: ["all-or-nothing thinking linking exam outcome to self-worth", "rumination cycle preventing both study and rest"],
      insight: "You're caught in a rumination loop where anxiety about NEET is preventing you from studying, and not studying increases your anxiety. This is classic burnout patterning — your brain is protecting you by refusing to engage.",
      suggestion: "Stop trying to study for today. Go for a 15-minute walk outside without your phone. Tomorrow, start with your strongest subject first to rebuild momentum. Your worth is not your NEET score.",
    },
    stress_score: 9,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "entry-4",
    user_id: "user-1",
    raw_text: "Good day today! Solved 30 Physics MCQs and got 25 right. Was able to focus for almost 2 hours straight after doing that breathing exercise. Maybe this is manageable after all. Had dinner with family and actually laughed for the first time this week.",
    ai_analysis: {
      stress_score: 3,
      triggers: [],
      dominant_emotion: "hopeful",
      hidden_patterns: ["breathing exercise measurably improved focus duration", "social connection correlates with mood recovery"],
      insight: "Today shows that the 4-7-8 breathing technique is working for you — your focus doubled after using it. Also, the laughter with family is a powerful stress buffer you should intentionally create more often.",
      suggestion: "Schedule one non-negotiable family meal per day. Even 20 minutes of genuine connection can reset your nervous system for better study sessions.",
    },
    stress_score: 3,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "entry-5",
    user_id: "user-1",
    raw_text: "Took a full-length test today. 610 marks. Improved by 30 from last week but still far from 650 target. The exam is 3 months away. Some days I feel like I can do it, other days it feels impossible. Tried studying at 5 AM this week — was productive but now I'm crashing by 8 PM.",
    ai_analysis: {
      stress_score: 6,
      triggers: ["time pressure", "score anxiety", "routine experimentation"],
      dominant_emotion: "ambivalence",
      hidden_patterns: ["30-point improvement in one week shows strong upward trajectory being discounted", "5 AM routine created a sleep debt crash cycle"],
      insight: "You improved 30 points in one week — that's a 4.6% gain. At this rate you'll hit 650 well before the exam. But the 5 AM experiment backfired: early wake disrupted your sleep enough to create an evening crash.",
      suggestion: "Shift to a 6:30 AM start instead of 5 AM. Add a 20-minute power nap after lunch. Your brain consolidates memory during sleep — protecting sleep quality is protecting your NEET score.",
    },
    stress_score: 6,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
]

export const mockChatHistory: ChatMessage[] = [
  {
    id: "chat-1",
    user_id: "user-1",
    role: "assistant",
    content: "Hey! I'm MindGuard, your study companion. I'm here to help you navigate the NEET prep journey — the stress, the doubts, the wins, and everything in between. How are you feeling today?",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "chat-2",
    user_id: "user-1",
    role: "user",
    content: "Honestly? Exhausted. I keep comparing myself to others and it's draining me.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "chat-3",
    user_id: "user-1",
    role: "assistant",
    content: "I hear you. Comparison is exhausting because it's a race with no finish line — there's always someone else ahead. But here's what I noticed from your journal: you studied 10 hours and improved your Physics. That's real. That's yours. The Instagram scores are highlights — you're comparing your behind-the-scenes with someone else's reel.\n\nLet's try something small: for the next 24 hours, every time you catch yourself comparing, take a breath and name one thing YOU did well today. Wanna try that?",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
]

export const mockWeeklyInsight: WeeklyInsight = {
  narrative:
    "This week showed a clear pattern: your stress spikes on days following poor sleep, and your best days followed evenings where you had social connection (like dinner with family). Performance anxiety around NEET is your dominant trigger, but the 4-7-8 breathing exercise is working — your focus doubled after using it. The 30-point improvement in your mock score demonstrates strong upward trajectory, even though you tend to discount your own progress.",
  top_triggers: [
    { trigger: "Performance Anxiety", count: 4 },
    { trigger: "Sleep Disruption", count: 3 },
    { trigger: "Family Pressure", count: 2 },
    { trigger: "Social Comparison", count: 2 },
    { trigger: "Self-Doubt", count: 2 },
  ],
  behavioral_nudge:
    "Try a 'comparison fast' for 48 hours — no social media, no score comparisons. Track how your focus and mood shift without the external benchmark noise.",
  week_start: new Date(Date.now() - 7 * 86400000).toISOString(),
  avg_mood: 5.8,
  last_week_avg_mood: 4.9,
}

export function getDaysUntilExam(): number {
  const examDate = new Date("2026-05-03")
  return Math.ceil((examDate.getTime() - Date.now()) / 86400000)
}

export function getRecentMoodAverage(): number {
  const recent = mockMoodLogs.slice(-7)
  return Math.round((recent.reduce((s, l) => s + l.mood, 0) / recent.length) * 10) / 10
}

export function getTopTriggers(): string[] {
  const triggerCounts = new Map<string, number>()
  for (const entry of mockJournalEntries) {
    for (const t of entry.ai_analysis?.triggers ?? []) {
      triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1)
    }
  }
  return [...triggerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)
}

export function getStreak(): number {
  let count = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const date = new Date(today.getTime() - i * 86400000)
    const hasEntry = mockMoodLogs.some(
      (l) => new Date(l.created_at).toDateString() === date.toDateString()
    )
    if (hasEntry) count++
    else break
  }
  return count
}
