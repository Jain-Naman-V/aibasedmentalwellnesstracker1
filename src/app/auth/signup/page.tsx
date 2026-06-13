"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { Brain, Loader2, Mail, Lock } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [mode, setMode] = useState<"signup" | "magic">("signup")
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const { signUp, signInWithMagicLink } = useAuth()
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await signUp(email, password)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      router.push("/onboarding")
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error: err } = await signInWithMagicLink(email)
    setLoading(false)
    if (err) {
      setError(err)
    } else {
      setMagicSent(true)
    }
  }

  if (magicSent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <Mail className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a magic sign-in link to <strong>{email}</strong>
          </p>
          <Link href="/auth/login" className="text-sm text-primary hover:underline">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Brain className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Join MindGuard</h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signup" ? "Create an account to get started" : "Enter your email for a magic link"}
          </p>
        </div>

        <form onSubmit={mode === "signup" ? handleSignUp : handleMagicLink} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="you@example.com"
              required
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signup" ? (
              <><Lock className="h-4 w-4" /> Create Account</>
            ) : (
              <><Mail className="h-4 w-4" /> Send Magic Link</>
            )}
          </button>
        </form>

        <div className="text-center space-y-2 text-sm text-muted-foreground">
          {mode === "signup" ? (
            <button onClick={() => setMode("magic")} className="text-primary hover:underline">
              Use a magic link instead
            </button>
          ) : (
            <button onClick={() => setMode("signup")} className="text-primary hover:underline">
              Create an account with password
            </button>
          )}
          <span className="block">Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link></span>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Your journal entries are stored securely linked only to your account. Your API key never leaves your device.
        </p>
      </div>
    </div>
  )
}
