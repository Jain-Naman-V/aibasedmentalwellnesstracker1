"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/AuthGuard"
import { Brain, Check, ArrowRight, ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { saveApiConfig, fetchModels, type ModelOption } from "@/lib/api-config"
import type { ExamType, OnboardingData } from "@/types"

type Step = 1 | 2 | 3 | 4

const examOptions: ExamType[] = ["NEET", "JEE", "CUET", "CAT", "GATE", "UPSC"]

const PRESET_PROVIDERS = [
  { label: "Anthropic", baseUrl: "https://api.anthropic.com/v1" },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1" },
  { label: "Groq", baseUrl: "https://api.groq.com/openai/v1" },
  { label: "Custom", baseUrl: "" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    exam_type: "",
    exam_date: "",
    study_hours: 0,
    biggest_fear: "",
  })
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [models, setModels] = useState<ModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [fetchingModels, setFetchingModels] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [otherExam, setOtherExam] = useState("")

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

  const handleFinish = async () => {
    setLoading(true)
    if (apiKey && baseUrl && selectedModel) {
      saveApiConfig({ apiKey, baseUrl, model: selectedModel })
    }
    localStorage.setItem("mindguard_onboarded", "true")
    localStorage.setItem("mindguard_profile", JSON.stringify({
      ...data,
      exam_type: data.exam_type === "Other" ? otherExam : data.exam_type,
      days_until_exam: data.exam_date
        ? Math.ceil((new Date(data.exam_date).getTime() - Date.now()) / 86400000)
        : 0,
    }))
    await new Promise((r) => setTimeout(r, 600))
    router.push("/dashboard")
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col px-4 py-8">
        <div className="mx-auto w-full max-w-md flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Step {step} of 4</span>
          </div>

          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex-1 space-y-6">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h1 className="text-2xl font-bold">Which exam are you preparing for?</h1>
                <p className="text-sm text-muted-foreground">This helps me personalize your experience</p>
                <div className="space-y-2">
                  {examOptions.map((exam) => (
                    <button
                      key={exam}
                      onClick={() => setData((d) => ({ ...d, exam_type: exam }))}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        data.exam_type === exam
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-input hover:border-primary/50"
                      }`}
                    >
                      {exam}
                    </button>
                  ))}
                  <button
                    onClick={() => setData((d) => ({ ...d, exam_type: "Other" }))}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      data.exam_type === "Other"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input hover:border-primary/50"
                    }`}
                  >
                    Other
                  </button>
                  {data.exam_type === "Other" && (
                    <input
                      autoFocus
                      value={otherExam}
                      onChange={(e) => setOtherExam(e.target.value)}
                      placeholder="Enter your exam name"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h1 className="text-2xl font-bold">When is your exam?</h1>
                <p className="text-sm text-muted-foreground">I&apos;ll count down the days with you</p>
                <input
                  type="date"
                  value={data.exam_date}
                  onChange={(e) => setData((d) => ({ ...d, exam_date: e.target.value }))}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base"
                />
                {data.exam_date && (
                  <p className="text-sm text-muted-foreground">
                    {Math.ceil((new Date(data.exam_date).getTime() - Date.now()) / 86400000)} days to go
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h1 className="text-2xl font-bold">A bit about your routine</h1>
                <p className="text-sm text-muted-foreground">So I can give you better advice</p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">How many hours do you study per day?</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={data.study_hours || ""}
                      onChange={(e) => setData((d) => ({ ...d, study_hours: parseInt(e.target.value) || 0 }))}
                      placeholder="e.g. 8"
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">What&apos;s your biggest fear about the exam?</label>
                    <textarea
                      value={data.biggest_fear}
                      onChange={(e) => setData((d) => ({ ...d, biggest_fear: e.target.value }))}
                      placeholder="e.g. Letting my parents down, not scoring enough..."
                      className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-base resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 space-y-4">
                <h1 className="text-2xl font-bold">Connect your AI</h1>
                <p className="text-sm text-muted-foreground">
                  Bring your own AI provider. Your API key stays in your browser only and is never stored on any server.
                  Works with OpenAI, Anthropic, Groq, or any OpenAI-compatible provider.
                </p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_PROVIDERS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => handleSelectProvider(p.label, p.baseUrl)}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
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
                    <label className="text-sm font-medium">Base URL</label>
                    <input
                      type="url"
                      value={baseUrl}
                      onChange={(e) => { setBaseUrl(e.target.value); setModels([]); setSelectedModel(""); setFetchError("") }}
                      placeholder="https://api.openai.com/v1"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Key</label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); setModels([]); setSelectedModel(""); setFetchError("") }}
                      placeholder="sk-... or your provider's key"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    onClick={handleFetchModels}
                    disabled={!baseUrl || !apiKey || fetchingModels}
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-input px-4 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
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

                  {models.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select a model</label>
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
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Your journal entries are stored securely in our database linked only to your account. Your API key never leaves your device. We never sell or share your data.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-6">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              disabled={step === 1}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-0 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={
                  (step === 1 && !data.exam_type) ||
                  (step === 2 && !data.exam_date) ||
                  (step === 3 && (!data.study_hours || !data.biggest_fear))
                }
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {loading ? "Saving..." : "Done"}
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
