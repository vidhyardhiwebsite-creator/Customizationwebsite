import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { useCartStore } from "../store/cartStore"
import { useWishlistStore } from "../store/wishlistStore"
import { isAdmin } from "../components/AdminRoute"
import toast from "react-hot-toast"

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { mergeLocalCart, loadCart } = useCartStore()
  const { loadWishlist } = useWishlistStore()

  useEffect(() => {
    let done = false

    const redirect = async (session) => {
      if (done) return
      done = true
      const user = session.user
      try {
        await Promise.all([
          mergeLocalCart(user.id),
          loadCart(user.id),
          loadWishlist(user.id),
        ])
      } catch {}
      toast.success(`Welcome, ${user.user_metadata?.full_name || user.email}!`)
      navigate(isAdmin(user) ? "/admin" : "/", { replace: true })
    }

    // 1. Try getSession first — works if Supabase already parsed the hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) redirect(session)
    })

    // 2. Listen for SIGNED_IN event as fallback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        redirect(session)
      }
    })

    // 3. Timeout fallback — if nothing happens in 5s, go to login
    const timeout = setTimeout(() => {
      if (!done) {
        done = true
        toast.error("Sign in timed out. Please try again.")
        navigate("/login", { replace: true })
      }
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Signing you in...</p>
        <p className="text-gray-600 text-xs mt-2">Please wait...</p>
      </div>
    </div>
  )
}
