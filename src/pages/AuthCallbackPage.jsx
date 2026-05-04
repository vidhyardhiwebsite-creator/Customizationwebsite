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
    const handleLogin = async () => {
      // Clean the ugly token URL immediately
      window.history.replaceState({}, document.title, "/auth/callback")

      const { data } = await supabase.auth.getSession()

      if (data.session) {
        const user = data.session.user
        try {
          await Promise.all([
            mergeLocalCart(user.id),
            loadCart(user.id),
            loadWishlist(user.id),
          ])
        } catch {}
        toast.success(`Welcome, ${user.user_metadata?.full_name || user.email}!`)
        navigate(isAdmin(user) ? "/admin" : "/", { replace: true })
      } else {
        // Wait for session via auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            subscription.unsubscribe()
            const user = session.user
            Promise.all([mergeLocalCart(user.id), loadCart(user.id), loadWishlist(user.id)])
              .catch(() => {})
              .finally(() => {
                toast.success(`Welcome, ${user.user_metadata?.full_name || user.email}!`)
                navigate(isAdmin(user) ? "/admin" : "/", { replace: true })
              })
          }
        })

        // Timeout fallback
        setTimeout(() => {
          subscription.unsubscribe()
          navigate("/login", { replace: true })
        }, 5000)
      }
    }

    handleLogin()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
