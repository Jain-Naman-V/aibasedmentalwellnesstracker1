import { NextResponse } from "next/server"
import { validateMood, validateTags, validateNote, sanitizeText } from "@/lib/validation"

interface MoodEntry {
  id: string
  mood: number
  tags: string[]
  note: string
  created_at: string
}

const moodStore: MoodEntry[] = []

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { mood, tags, note } = body

    const moodError = validateMood(mood)
    if (moodError) {
      return NextResponse.json({ error: moodError.message }, { status: 400 })
    }

    const tagsError = validateTags(tags)
    if (tagsError) {
      return NextResponse.json({ error: tagsError.message }, { status: 400 })
    }

    const noteError = validateNote(note)
    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 400 })
    }

    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      mood: mood as number,
      tags: (tags as string[])?.map(sanitizeText) ?? [],
      note: note ? sanitizeText(note as string) : "",
      created_at: new Date().toISOString(),
    }

    moodStore.push(entry)

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    console.error("Mood API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  const last30 = moodStore.slice(-30)
  return NextResponse.json(last30)
}
