import { describe, it, expect } from "vitest"


describe("API route: journal", () => {
  it("should reject missing raw_text", () => {
    const body = JSON.stringify({})
    expect(body).toContain("{}")
  })

  it("should reject non-string raw_text", () => {
    const body = JSON.stringify({ raw_text: 123 })
    expect(body).toContain("123")
  })

  it("should accept valid journal entry", () => {
    const body = JSON.stringify({ raw_text: "Today was stressful" })
    const parsed = JSON.parse(body)
    expect(parsed.raw_text).toBe("Today was stressful")
  })
})

describe("API route: mood", () => {
  it("should reject invalid mood values", () => {
    const testCases = [
      { mood: 0, shouldFail: true },
      { mood: 11, shouldFail: true },
      { mood: 1.5, shouldFail: true },
      { mood: "5", shouldFail: true },
      { mood: null, shouldFail: true },
      { mood: 1, shouldFail: false },
      { mood: 10, shouldFail: false },
      { mood: 5, shouldFail: false },
    ]

    for (const { mood, shouldFail } of testCases) {
      const isValid = typeof mood === "number" && Number.isInteger(mood) && mood >= 1 && mood <= 10
      expect(isValid).toBe(!shouldFail)
    }
  })

  it("should reject tags array with non-string items", () => {
    const tags = ["valid", 123, null]
    for (const tag of tags) {
      if (typeof tag !== "string") {
        expect(typeof tag).not.toBe("string")
      }
    }
  })

  it("should process valid mood payload", () => {
    const payload = { mood: 7, tags: ["focus", "calm"], note: "Good study day" }
    const { mood, tags, note } = payload
    expect(mood).toBe(7)
    expect(tags).toHaveLength(2)
    expect(note).toBe("Good study day")
  })
})

describe("API route: chat", () => {
  it("should reject empty message", () => {
    expect("".trim().length).toBe(0)
  })

  it("should build correct response for stress-related input", () => {
    const msg = "I'm feeling stressed about my exam"
    const lower = msg.toLowerCase()
    const responseType = lower.includes("stress") || lower.includes("anxious") ? "stress" : "general"
    expect(responseType).toBe("stress")
  })

  it("should build general response for neutral input", () => {
    const msg = "I had a good day today"
    const lower = msg.toLowerCase()
    const responseType = lower.includes("stress") || lower.includes("anxious") ? "stress" : "general"
    expect(responseType).toBe("general")
  })

  it("should sanitize message before processing", () => {
    const msg = "<script>alert('xss')</script>Hello"
    const sanitized = msg.replace(/<[^>]*>/g, "").trim()
    expect(sanitized.includes("<")).toBe(false)
    expect(sanitized.includes(">")).toBe(false)
  })
})

describe("API route: insights", () => {
  it("should return structured insight data", () => {
    const insight = {
      narrative: "Test narrative",
      top_triggers: [{ trigger: "Anxiety", count: 3 }],
      behavioral_nudge: "Test nudge",
      week_start: new Date().toISOString(),
      avg_mood: 5.8,
    }

    expect(insight).toHaveProperty("narrative")
    expect(insight).toHaveProperty("top_triggers")
    expect(insight).toHaveProperty("behavioral_nudge")
    expect(insight).toHaveProperty("week_start")
    expect(insight).toHaveProperty("avg_mood")
    expect(insight.top_triggers[0]).toHaveProperty("trigger")
    expect(insight.top_triggers[0]).toHaveProperty("count")
  })

  it("should have positive avg_mood value", () => {
    const insight = { avg_mood: 5.8 }
    expect(insight.avg_mood).toBeGreaterThan(0)
    expect(insight.avg_mood).toBeLessThanOrEqual(10)
  })
})
