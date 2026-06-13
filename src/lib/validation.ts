const MAX_RAW_TEXT_LENGTH = 5000
const MAX_NOTE_LENGTH = 1000
const MAX_TAGS = 10
const MAX_TAG_LENGTH = 50
const MAX_CHAT_MESSAGE_LENGTH = 2000

export interface ValidationError {
  field: string
  message: string
}

export function validateJournalText(text: unknown): ValidationError | null {
  if (!text || typeof text !== "string") {
    return { field: "raw_text", message: "raw_text must be a non-empty string" }
  }
  const trimmed = text.trim()
  if (trimmed.length === 0) {
    return { field: "raw_text", message: "raw_text must not be empty" }
  }
  if (trimmed.length > MAX_RAW_TEXT_LENGTH) {
    return { field: "raw_text", message: `raw_text must be under ${MAX_RAW_TEXT_LENGTH} characters` }
  }
  return null
}

export function validateMood(mood: unknown): ValidationError | null {
  if (typeof mood !== "number" || !Number.isInteger(mood)) {
    return { field: "mood", message: "mood must be an integer" }
  }
  if (mood < 1 || mood > 10) {
    return { field: "mood", message: "mood must be between 1 and 10" }
  }
  return null
}

export function validateTags(tags: unknown): ValidationError | null {
  if (!Array.isArray(tags)) {
    return null
  }
  if (tags.length > MAX_TAGS) {
    return { field: "tags", message: `tags must have at most ${MAX_TAGS} items` }
  }
  for (const tag of tags) {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      return { field: "tags", message: "each tag must be a non-empty string" }
    }
    if (tag.length > MAX_TAG_LENGTH) {
      return { field: "tags", message: `each tag must be under ${MAX_TAG_LENGTH} characters` }
    }
  }
  return null
}

export function validateNote(note: unknown): ValidationError | null {
  if (!note || typeof note !== "string") {
    return null
  }
  if (note.length > MAX_NOTE_LENGTH) {
    return { field: "note", message: `note must be under ${MAX_NOTE_LENGTH} characters` }
  }
  return null
}

export function validateChatMessage(message: unknown): ValidationError | null {
  if (!message || typeof message !== "string") {
    return { field: "message", message: "message must be a non-empty string" }
  }
  const trimmed = message.trim()
  if (trimmed.length === 0) {
    return { field: "message", message: "message must not be empty" }
  }
  if (trimmed.length > MAX_CHAT_MESSAGE_LENGTH) {
    return { field: "message", message: `message must be under ${MAX_CHAT_MESSAGE_LENGTH} characters` }
  }
  return null
}

export function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim()
}
