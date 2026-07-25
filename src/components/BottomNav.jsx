import { Link, useLocation } from "react-router-dom"
import { Home, Grid, ShoppingCart, User } from "lucide-react"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"

const NAV_ITEMS = [
  { icon: Home,         label: "Home",       to: "/" },
  { icon: Grid,         label: "Categories", to: "/products" },
  { icon: ShoppingCart, label: "Cart",        to: "/cart",   badge: true },
  { icon: User,         label: "Account",    to: null },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const cartCount = useCartStore(s => s.getCount())
  const { user } = useAuthStore()

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const to = item.to === null ? (user ? "/profile" : "/login") : item.to
        const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to.split("?")[0])
        const Icon = item.icon
        const badge = item.badge ? cartCount : 0

        return (
          <Link
            key={item.label}
            to={to}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              textDecoration: "none",
              color: isActive ? "#C8A23A" : "#8F857A",
              transition: "color 0.2s",
              position: "relative",
            }}
          >
            {/* Active top indicator */}
            {isActive && (
              <span style={{
                position: "absolute",
                top: 0, left: "50%",
                transform: "translateX(-50%)",
                width: 28, height: 2,
                borderRadius: "0 0 3px 3px",
                background: "linear-gradient(90deg, #C8A23A, #D4AF37)",
              }} />
            )}

            {/* Icon with badge */}
            <span style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {badge > 0 && (
                <span style={{
                  position: "absolute",
                  top: -4, right: -5,
                  minWidth: 16, height: 16, padding: "0 3px",
                  borderRadius: 999, fontSize: 9, fontWeight: 800,
                  fontFamily: "'Inter', sans-serif",
                  background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                  color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1,
                  border: "1.5px solid #fff",
                }}>
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </span>

            {/* Label */}
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10,
              fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.03em",
              lineHeight: 1,
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
