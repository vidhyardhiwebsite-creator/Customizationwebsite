import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Package, ShoppingBag, BarChart3, Users,
  Bell, Menu, X, LogOut, ChevronRight, AlertTriangle,
  Store, Image, Tag, Settings
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import { useAdminStore } from "../../store/adminStore"
import { supabase } from "../../lib/supabase"
import toast from "react-hot-toast"

const NAV = [
  { path: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { path: "/admin/products",   label: "Products",   icon: Package },
  { path: "/admin/orders",     label: "Orders",     icon: ShoppingBag },
  { path: "/admin/categories", label: "Categories", icon: Tag },
  { path: "/admin/banners",    label: "Banners",    icon: Image },
  { path: "/admin/analytics",  label: "Analytics",  icon: BarChart3 },
  { path: "/admin/users",      label: "Users",      icon: Users },
]

/* ── Sidebar ── */
function Sidebar({ pathname, onSignOut, onNavClick }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: "#2C241B",
      display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <Link to="/admin" onClick={onNavClick} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 38, height: 38, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "flex-start" }}>
            <img src="/logo.png" alt="Vidhyrathi" style={{ width: 38, height: "auto", display: "block", marginTop: "-2px" }} />
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 700, fontSize: 16, color: "#FFFFFF", margin: 0, lineHeight: 1.2 }}>Vidyarathi</p>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#C8A23A", margin: 0 }}>Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = pathname === path || (path !== "/admin" && pathname.startsWith(path))
          return (
            <Link key={path} to={path} onClick={onNavClick}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10, marginBottom: 2,
                textDecoration: "none",
                fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: active ? 600 : 400,
                background: active ? "linear-gradient(135deg, rgba(200,162,58,0.18), rgba(200,162,58,0.08))" : "transparent",
                color: active ? "#E4C55A" : "rgba(255,255,255,0.6)",
                border: active ? "1px solid rgba(200,162,58,0.2)" : "1px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#FFFFFF" } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" } }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={13} style={{ flexShrink: 0, opacity: 0.7 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <Link to="/"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, textDecoration: "none", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#FFFFFF" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}>
          <Store size={17} /> Switch to Store
        </Link>
        <button onClick={onSignOut}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 14, color: "rgba(255,255,255,0.6)", width: "100%", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,83,79,0.12)"; e.currentTarget.style.color = "#F87171" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)" }}>
          <LogOut size={17} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

/* ── Main layout ── */
export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 1024)
  const [notifOpen, setNotifOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { pathname } = useLocation()
  const { signOut, user } = useAuthStore()
  const { notifications, clearNotification, addNotification } = useAdminStore()
  const navigate   = useNavigate()
  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const fn = () => { if (window.innerWidth < 1024) setSidebarOpen(false) }
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  useEffect(() => {
    const h = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", h)
    document.addEventListener("touchstart", h)
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("touchstart", h) }
  }, [])

  const handleBellClick = () => {
    if (notifOpen) {
      useAdminStore.getState().notifications.forEach(n => clearNotification(n.id))
    }
    setNotifOpen(o => !o)
  }

  const handleSignOut = async () => { await signOut(); toast.success("Signed out"); navigate("/") }

  useEffect(() => {
    const channel = supabase.channel("admin-new-orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, payload => {
        const o = payload.new
        const addr = (() => { try { return typeof o.address === "string" ? JSON.parse(o.address) : (o.address || {}) } catch { return {} } })()
        const name = addr.full_name || "A customer"
        const amt  = o.total_amount ? `₹${Math.ceil(o.total_amount).toLocaleString("en-IN")}` : ""
        const id   = o.display_order_id || `#${String(o.id).slice(-6).toUpperCase()}`
        addNotification(`🛍️ New order ${id} from ${name} ${amt}`, "info")
        useAdminStore.getState().loadOrders(true)
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const currentLabel = NAV.find(n => pathname === n.path || (n.path !== "/admin" && pathname.startsWith(n.path)))?.label || "Admin"

  /* ── Track if viewport is mobile ── */
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 1024)
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  return (
    <div style={{ display: "flex", height: "100vh", background: "#F8F5F0", overflow: "hidden" }}>

      {/* ── DESKTOP SIDEBAR — in-flow, pushes content right ── */}
      {!isMobile && sidebarOpen && (
        <div style={{ flexShrink: 0, height: "100vh" }}>
          <Sidebar pathname={pathname} onSignOut={handleSignOut} onNavClick={() => {}} />
        </div>
      )}

      {/* ── MOBILE SIDEBAR — overlay drawer ── */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(44,36,27,0.55)", zIndex: 49, backdropFilter: "blur(2px)" }}
            />
            <motion.div
              initial={{ x: "-100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.25,0.46,0.45,0.94] }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, height: "100vh", maxWidth: "80vw" }}
            >
              <Sidebar pathname={pathname} onSignOut={handleSignOut} onNavClick={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, maxWidth: "100vw" }}>

        {/* ── Header ── */}
        <header style={{
          height: 60,
          background: "#FFFFFF",
          borderBottom: "1px solid #E7DED1",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
          boxShadow: "0 1px 6px rgba(44,36,27,0.06)",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          {/* Left: hamburger + active section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #E7DED1", background: "#FDFCFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6F655A", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.color = "#C8A23A" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.color = "#6F655A" }}>
              <Menu size={18} />
            </button>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 16, fontWeight: 700, color: "#2C241B", margin: 0, whiteSpace: "nowrap" }}>
              {currentLabel}
            </h2>
          </div>

          {/* Right: bell + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Bell */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button onClick={handleBellClick}
                style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #E7DED1", background: "#FDFCFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6F655A", position: "relative" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.color = "#C8A23A" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.color = "#6F655A" }}>
                <Bell size={17} />
                {notifications.length > 0 && (
                  <span style={{ position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: "#D9534F", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
                    {notifications.length > 9 ? "9+" : notifications.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                    style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 280, maxWidth: "calc(100vw - 32px)", background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 16, boxShadow: "0 8px 32px rgba(44,36,27,0.12)", zIndex: 200, overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F3EEE6" }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, color: "#2C241B" }}>Notifications</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {notifications.length > 0 && (
                          <button onClick={() => notifications.forEach(n => clearNotification(n.id))} style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#C8A23A", background: "none", border: "none", cursor: "pointer" }}>Clear all</button>
                        )}
                        <button onClick={() => setNotifOpen(false)} style={{ color: "#8F857A", background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={14} /></button>
                      </div>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: "auto" }}>
                      {notifications.length === 0
                        ? <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A", textAlign: "center", padding: "24px 16px" }}>No notifications</p>
                        : notifications.map(n => (
                          <div key={n.id} onClick={() => { clearNotification(n.id); setNotifOpen(false) }}
                            style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 16px", borderBottom: "1px solid #F8F5F0", cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#F8F5F0"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <AlertTriangle size={13} style={{ color: n.type === "warning" ? "#D97706" : "#C8A23A", marginTop: 2, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#2C241B", margin: 0, lineHeight: 1.5 }}>{n.msg}</p>
                              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#8F857A", margin: 0, marginTop: 2 }}>{new Date(n.time).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button onClick={() => setProfileOpen(o => !o)}
                style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #D4AF37, #A88422)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #E7DED1", overflow: "hidden" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#C8A23A"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#E7DED1"}>
                {user?.user_metadata?.avatar_url
                  ? <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 15, color: "#fff" }}>{(user?.user_metadata?.full_name || user?.email || "A")[0]?.toUpperCase()}</span>}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
                    style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "#FFFFFF", border: "1px solid #E7DED1", borderRadius: 14, boxShadow: "0 8px 32px rgba(44,36,27,0.12)", zIndex: 200, overflow: "hidden" }}>
                    <div style={{ padding: "12px 14px", borderBottom: "1px solid #F3EEE6" }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#2C241B", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.user_metadata?.full_name || "Admin"}</p>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#8F857A", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
                    </div>
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6F655A", textDecoration: "none" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#F8F5F0"; e.currentTarget.style.color = "#2C241B" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6F655A" }}>
                      <Store size={14} style={{ color: "#C8A23A" }} /> View Store
                    </Link>
                    <button onClick={() => { setProfileOpen(false); handleSignOut() }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", width: "100%", fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#D9534F", background: "none", border: "none", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#FFF5F5"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#F8F5F0]">
          {children}
        </main>
      </div>
    </div>
  )
}
