export interface ApiConfig {
  apiKey: string
  baseUrl: string
  model: string
}

const STORAGE_KEY = "mindguard-api-config"

export function getApiConfig(): ApiConfig | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveApiConfig(config: ApiConfig): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function clearApiConfig(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "****"
  return key.slice(0, 4) + "****" + key.slice(-4)
}

export interface ModelOption {
  id: string
  name?: string
}

export async function fetchModels(baseUrl: string, apiKey: string): Promise<ModelOption[]> {
  const modelsUrl = baseUrl.endsWith("/") ? `${baseUrl}models` : `${baseUrl}/models`

  const attempts: Promise<ModelOption[]>[] = []

  const tryFetch = (headers: Record<string, string>): Promise<ModelOption[]> =>
    fetch(modelsUrl, { headers, signal: new AbortController().signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (json.data && Array.isArray(json.data)) {
          return json.data.map((m: { id: string; name?: string }) => ({
            id: m.id,
            name: m.name ?? m.id,
          }))
        }
        if (json.models && Array.isArray(json.models)) {
          return json.models.map((m: { id: string; name?: string }) => ({
            id: m.id,
            name: m.name ?? m.id,
          }))
        }
        throw new Error("Unknown response format")
      })

  attempts.push(tryFetch({ Authorization: `Bearer ${apiKey}` }))
  attempts.push(tryFetch({ "x-api-key": apiKey }))

  const results = await Promise.allSettled(attempts)
  for (const result of results) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      return result.value
    }
  }
  throw new Error(
    "Could not fetch models. Check your base URL and API key. For OpenAI-compatible providers, use the base URL without /chat/completions (e.g. https://api.openai.com/v1)"
  )
}
