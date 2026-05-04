import { create } from "zustand"
import { supabase } from "../lib/supabase"

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    // onAuthStateChange handles hash parsing for OAuth callbacks automatically
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, loading: false })
    })
    // Also get current session immediately
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://www.nashejewels.in/auth/callback",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    })
    if (error) throw error
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    return data
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
