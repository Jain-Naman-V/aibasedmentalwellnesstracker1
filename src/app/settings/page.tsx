"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/AuthGuard"
import { NavBar } from "@/components/NavBar"
import { getApiConfig, saveApiConfig, maskApiKey, fetchModels, type ModelOption } from "@/lib/api-config"
import { mockUser } from "@/data/mock-data"
import { Save, Shield, Check, Loader2, RefreshCw } from "lucide-react"
import type { ExamType } from "@/types"

const examOptions: ExamType[] = ["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"]

const PRESET_PROVIDERS = [
  { label: "Anthropic", baseUrl: "https://api.anthropic.com/v1" },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { label: "Groq", baseUrl: "https://api.groq.com/openai/v1" },
  { label: "Custom", baseUrl: "" },
]

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [fetchingModels, setFetchingModels] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "fail" | null>(null)
  const [examType, setExamType] = useState<string>(mockUser.exam_type)
  const [examDate, setExamDate] = useState(mockUser.exam_date)

  useEffect(() => {
    const config = getApiConfig()
    if (config) {
      setApiKey(config.apiKey)
      setBaseUrl(config.baseUrl)
      setSelectedModel(config.model)
      const matched = PRESET_PROVIDERS.find((p) => p.baseUrl === config.baseUrl)
      if (matched) setSelectedProvider(matched.label)
      if (config.apiKey && config.baseUrl) {
        fetchModels(config.baseUrl, config.apiKey)
          .then((result) => {
            setModels(result)
            if (config.model && !result.some((m) => m.id === config.model)) {
              setSelectedModel("")
            }
          })
          .catch(() => {})
      }
    }
  }, [])

  const handleSelectProvider = (label: string, url: string) => {
    setSelectedProvider(label)
    setBaseUrl(url)
    setModels([])
    setSelectedModel("")
    setFetchError("")
  }

  const handleFetchModels = async () => {
    if (!baseUrl || !apiKey) return
    setFetchingModels(true)
    setFetchError("")
    setModels([])
    setSelectedModel("")
    try {
      const result = await fetchModels(baseUrl, apiKey)
      setModels(result)
      if (result.length === 1) setSelectedModel(result[0].id)
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to fetch models")
    } finally {
      setFetchingModels(false)
    }
  }

  const handleSaveApi = () => {
    saveApiConfig({ apiKey, baseUrl, model: selectedModel })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      await fetchModels(baseUrl, apiKey)
      setTestResult("success")
    } catch {
      setTestResult("fail")
    } finally {
      setTesting(false)
    }
  }

  const handleProfileSave = () => {
    const profile = JSON.parse(localStorage.getItem("mindguard_profile") || "{}")
    localStorage.setItem("mindguard_profile", JSON.stringify({
      ...profile,
      exam_type: examType,
      exam_date: examDate,
    }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const configComplete = apiKey && baseUrl && selectedModel

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        <div className="mx-auto max-w-lg space-y-6 px-4 pt-8">
          <h1 className="text-2xl font-bold">Settings</h1>

          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h2 className="text-sm font-medium">Profile</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Exam Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select exam</option>
                  {examOptions.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={handleProfileSave}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Save className="h-4 w-4" /> Update Profile
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-4">
            <h2 className="text-sm font-medium">AI Settings</h2>
            <p className="text-xs text-muted-foreground">
              Your API key stays on this device only. It is never sent to our servers.
              Works with OpenAI, Anthropic, Groq, or any OpenAI-compatible provider.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_PROVIDERS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSelectProvider(p.label, p.baseUrl)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedProvider === p.label
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input hover:border-primary/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Base URL</label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => { setBaseUrl(e.target.value); setModels([]); setSelectedModel(""); setFetchError("") }}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => { setApiKey(e.target.value); setModels([]); setSelectedModel(""); setFetchError("") }}
                  placeholder={maskApiKey(apiKey) || "sk-..."}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <button
                onClick={handleFetchModels}
                disabled={!baseUrl || !apiKey || fetchingModels}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                {fetchingModels ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {fetchingModels ? "Fetching models..." : "Fetch available models"}
              </button>

              {fetchError && (
                <p className="text-xs text-red-500" role="alert">{fetchError}</p>
              )}

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Selected Model</label>
                {models.length > 0 ? (
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Choose a model...</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name ?? m.id}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex h-10 w-full items-center rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    {selectedModel
                      ? <span className="text-foreground">{selectedModel}</span>
                      : <span>Fetch models to see available options</span>}
                    {fetchingModels && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveApi}
                disabled={!configComplete}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saved ? <><Check className="h-4 w-4" /> Saved</> : <><Save className="h-4 w-4" /> Save</>}
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testing || !configComplete}
                className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
              >
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Test Connection
              </button>
            </div>
            {testResult && (
              <p className={`text-xs ${testResult === "success" ? "text-green-600" : "text-red-500"}`}>
                {testResult === "success" ? "✓ Connection successful" : "✗ Connection failed. Check your API key and base URL."}
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-3">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Privacy
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your journal entries are stored securely in our database linked only to your account.
              Your API key never leaves your device. We never sell or share your data.
            </p>
          </div>
        </div>
        <NavBar />
      </div>
    </AuthGuard>
  )
}
