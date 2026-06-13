export type ExamType = "NEET" | "JEE" | "CUET" | "CAT" | "GATE" | "UPSC" | "Other"

export interface UserProfile {
  id: string
  exam_type: ExamType | ""
  exam_date: string
  study_hours: number
  biggest_fear: string
  days_until_exam: number
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  raw_text: string
  ai_analysis: AIAnalysis | null
  stress_score: number | null
  created_at: string
}

export interface MoodLog {
  id: string
  user_id: string
  mood: number
  tags: string[]
  note: string
  created_at: string
}

export interface ChatMessage {
  id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface AIAnalysis {
  stress_score: number
  triggers: string[]
  dominant_emotion: string
  hidden_patterns: string[]
  insight: string
  suggestion: string
}

export interface WeeklyInsight {
  narrative: string
  top_triggers: { trigger: string; count: number }[]
  behavioral_nudge: string
  week_start: string
  avg_mood: number
  last_week_avg_mood: number
}

export interface ChatRequest {
  message: string
  history: { role: "user" | "assistant"; content: string }[]
  user_context: {
    exam_type: string
    days_until_exam: number
    recent_mood_avg: number
    recent_triggers: string[]
  }
}

export interface JournalRequest {
  raw_text: string
}

export interface MoodRequest {
  mood: number
  tags: string[]
  note: string
}

export interface OnboardingData {
  exam_type: ExamType | ""
  exam_date: string
  study_hours: number
  biggest_fear: string
}

export interface AuthUser {
  id: string
  email: string
}
