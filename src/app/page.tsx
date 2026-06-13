"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BackgroundLines } from "@/components/ui/background-lines"
import { Brain, ArrowRight, BarChart3, MessageCircle, Sparkles } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()
  const [onboarded, setOnboarded] = useState(false)

  useEffect(() => {
    setOnboarded(
      localStorage.getItem("mindguard_onboarded") === "true" ||
      localStorage.getItem("mindguard-mock-user") !== null
    )
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <BackgroundLines className="bg-black flex flex-col min-h-screen">
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-white" />
              <span className="text-lg font-bold text-white">MindGuard</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60">
                <Sparkles className="h-3 w-3" />
                AI-Powered Wellness for Students
              </div>

              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
                Your AI Companion for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {" "}Exam Stress
                </span>
              </h1>

              <p className="text-lg text-white/60 max-w-lg mx-auto leading-relaxed">
                MindGuard analyzes your daily journal entries and mood patterns to uncover hidden stress triggers,
                offering personalized coping strategies — like a friend who truly understands what exam season feels like.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push(onboarded ? "/dashboard" : "/auth/signup")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90 transition-colors"
                >
                  {onboarded ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  I have an account
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto">
                {[
                  { icon: MessageCircle, label: "AI Chat" },
                  { icon: Sparkles, label: "Journal Analysis" },
                  { icon: BarChart3, label: "Mood Insights" },
                ].map((item) => (
                  <div key={item.label} className="text-center space-y-2">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 mx-auto">
                      <item.icon className="h-5 w-5 text-white/70" />
                    </div>
                    <p className="text-xs text-white/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <footer className="px-6 py-4 text-center">
            <p className="text-xs text-white/30">
              MindGuard is a wellness companion, not a medical professional. If you&apos;re in crisis, please reach out to iCall (+91-9152987821) or Vandrevala Foundation (1860-266-2345).
            </p>
          </footer>
        </div>
      </BackgroundLines>
    </div>
  )
}
