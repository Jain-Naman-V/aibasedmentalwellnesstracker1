"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { AuthUser } from "@/types"

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signInWithMagicLink: (email: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const mockUser: AuthUser = { id: "mock-user-1", email: "demo@mindguard.app" }

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signUp: async () => ({}),
  signIn: async () => ({}),
  signInWithMagicLink: async () => ({}),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const configured = isSupabaseConfigured()
    if (!configured) {
      const stored = localStorage.getItem("mindguard-mock-user")
      if (stored) setUser(JSON.parse(stored))
      setLoading(false)
      return
    }
    supabase!.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email ?? "" })
      }
      setLoading(false)
    })
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      const u = { id: crypto.randomUUID(), email }
      setUser(u)
      localStorage.setItem("mindguard-mock-user", JSON.stringify(u))
      return {}
    }
    const { error } = await supabase!.auth.signUp({ email, password })
    return { error: error?.message }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      setUser(mockUser)
      localStorage.setItem("mindguard-mock-user", JSON.stringify(mockUser))
      return {}
    }
    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    return { error: error?.message }
  }, [])

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      setUser(mockUser)
      localStorage.setItem("mindguard-mock-user", JSON.stringify(mockUser))
      return {}
    }
    const { error } = await supabase!.auth.signInWithOtp({ email })
    return { error: error?.message }
  }, [])

  const signOut = useCallback(async () => {
    setUser(null)
    localStorage.removeItem("mindguard-mock-user")
    if (isSupabaseConfigured()) await supabase!.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
