import { Navigate } from "react-router-dom"
import { useAuthStore } from "../store/authStore"

// Add your admin email(s) here. Anyone with these emails gets admin access.
const ADMIN_EMAILS = [
  import.meta.env.VITE_ADMIN_EMAIL,
  "sailendrakondapalli@gmail.com",
  "adduriaswani@gmail.com",
  "vidhyardhiwebsite@gmail.com",
].filter(Boolean).map(e => e.toLowerCase())

export const isAdmin = (user) => {
  if (!user) return false
  return ADMIN_EMAILS.includes(user.email?.toLowerCase())
}

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#4DB6AC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin(user)) return <Navigate to="/" replace />

  return children
}
