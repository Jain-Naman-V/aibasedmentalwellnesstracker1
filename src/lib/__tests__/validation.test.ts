import { describe, it, expect } from "vitest"
import {
  validateJournalText,
  validateMood,
  validateTags,
  validateNote,
  validateChatMessage,
  sanitizeText,
} from "../validation"

describe("validateJournalText", () => {
  it("should return null for valid non-empty string", () => {
    expect(validateJournalText("Today was a good day")).toBeNull()
    expect(validateJournalText("a")).toBeNull()
  })

  it("should return error for null or undefined", () => {
    expect(validateJournalText(null)).toHaveProperty("field", "raw_text")
    expect(validateJournalText(undefined)).toHaveProperty("field", "raw_text")
  })

  it("should return error for non-string types", () => {
    expect(validateJournalText(123)).toHaveProperty("field", "raw_text")
    expect(validateJournalText([])).toHaveProperty("field", "raw_text")
    expect(validateJournalText({})).toHaveProperty("field", "raw_text")
  })

  it("should return error for empty string", () => {
    expect(validateJournalText("")).toHaveProperty("field", "raw_text")
  })

  it("should return error for whitespace-only string", () => {
    expect(validateJournalText("   ")).toHaveProperty("field", "raw_text")
  })

  it("should return error for strings over 5000 characters", () => {
    const long = "x".repeat(5001)
    const result = validateJournalText(long)
    expect(result).toHaveProperty("field", "raw_text")
    expect(result!.message).toContain("5000")
  })

  it("should accept string at exactly 5000 characters", () => {
    expect(validateJournalText("x".repeat(5000))).toBeNull()
  })
})

describe("validateMood", () => {
  it("should return null for valid mood values 1-10", () => {
    for (const v of [1, 5, 10]) {
      expect(validateMood(v)).toBeNull()
    }
  })

  it("should return error for non-integer values", () => {
    expect(validateMood(1.5)).toHaveProperty("field", "mood")
    expect(validateMood("5")).toHaveProperty("field", "mood")
    expect(validateMood(null)).toHaveProperty("field", "mood")
  })

  it("should return error for out-of-range values", () => {
    expect(validateMood(0)).toHaveProperty("field", "mood")
    expect(validateMood(11)).toHaveProperty("field", "mood")
    expect(validateMood(-1)).toHaveProperty("field", "mood")
  })

  it("should validate boundary values", () => {
    expect(validateMood(1)).toBeNull()
    expect(validateMood(10)).toBeNull()
  })
})

describe("validateTags", () => {
  it("should return null for valid tag arrays", () => {
    expect(validateTags(["stress", "focus"])).toBeNull()
    expect(validateTags([])).toBeNull()
  })

  it("should return null for non-array input", () => {
    expect(validateTags(undefined)).toBeNull()
    expect(validateTags(null)).toBeNull()
    expect(validateTags("not-an-array")).toBeNull()
  })

  it("should reject arrays with more than 10 items", () => {
    const manyTags = Array.from({ length: 11 }, (_, i) => `tag-${i}`)
    const result = validateTags(manyTags)
    expect(result).toHaveProperty("field", "tags")
    expect(result!.message).toContain("10")
  })

  it("should reject empty-string tags", () => {
    expect(validateTags(["valid", ""])).toHaveProperty("field", "tags")
    expect(validateTags(["valid", "  "])).toHaveProperty("field", "tags")
  })

  it("should reject tags over 50 characters", () => {
    expect(validateTags(["x".repeat(51)])).toHaveProperty("field", "tags")
  })
})

describe("validateNote", () => {
  it("should return null for valid notes", () => {
    expect(validateNote("A short note")).toBeNull()
    expect(validateNote("")).toBeNull()
    expect(validateNote(undefined)).toBeNull()
    expect(validateNote(null)).toBeNull()
  })

  it("should reject notes over 1000 characters", () => {
    expect(validateNote("x".repeat(1001))).toHaveProperty("field", "note")
  })

  it("should accept note at exactly 1000 characters", () => {
    expect(validateNote("x".repeat(1000))).toBeNull()
  })
})

describe("validateChatMessage", () => {
  it("should return null for valid messages", () => {
    expect(validateChatMessage("Hello")).toBeNull()
    expect(validateChatMessage("a")).toBeNull()
  })

  it("should reject empty or whitespace messages", () => {
    expect(validateChatMessage("")).toHaveProperty("field", "message")
    expect(validateChatMessage("   ")).toHaveProperty("field", "message")
  })

  it("should reject messages over 2000 characters", () => {
    expect(validateChatMessage("x".repeat(2001))).toHaveProperty("field", "message")
  })

  it("should reject non-string input", () => {
    expect(validateChatMessage(123)).toHaveProperty("field", "message")
    expect(validateChatMessage(null)).toHaveProperty("field", "message")
  })
})

describe("sanitizeText", () => {
  it("should remove HTML tags but preserve text content", () => {
    expect(sanitizeText("<script>alert('xss')</script>Hello")).toBe("alert('xss')Hello")
    expect(sanitizeText("<p>Safe text</p>")).toBe("Safe text")
  })

  it("should trim whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello")
  })

  it("should preserve normal text", () => {
    expect(sanitizeText("Normal text with numbers 123")).toBe("Normal text with numbers 123")
  })

  it("should handle empty input", () => {
    expect(sanitizeText("")).toBe("")
  })
})
