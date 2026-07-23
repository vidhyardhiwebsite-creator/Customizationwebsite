import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart, Heart, Search, Menu, X, User, LogOut,
  ChevronDown, Package, Settings, Store
} from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useCartStore } from "../store/cartStore"
import { useCategoryStore } from "../store/categoryStore"
import { useAdminStore } from "../store/adminStore"
import toast from "react-hot-toast"
import { isAdmin as checkIsAdmin } from "./AdminRoute"

/* ─────────────────────────────────────────
   NAV LINKS
───────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",              to: "/",                              dropdown: false },
  { label: "Categories",        to: "/products",                      dropdown: true  },
  { label: "Personalized Gifts",to: "/products?tags=personalized",    dropdown: false },
  { label: "Corporate Gifts",   to: "/products?category=Corporate+Gifts", dropdown: false },
  { label: "Bulk Orders",       to: "/contact",                       dropdown: false },
  { label: "About",             to: "/contact",                       dropdown: false },
  { label: "Contact",           to: "/contact",                       dropdown: false },
]

/* ─────────────────────────────────────────
   ICON BUTTON — 44px circle, white bg,
   #ECE5DA border, gold hover, lift 2px
───────────────────────────────────────── */
function IconBtn({ children, onClick, to, badge, title, className = "" }) {
  const base = {
    width: 40, height: 40,
    borderRadius: "50%",
    background: "#FFFFFF",
    border: "1px solid #ECE5DA",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    cursor: "pointer",
    transition: "all 0.22s ease",
    color: "#4A4036",
    boxShadow: "0 1px 6px rgba(44,36,27,0.07)",
    textDecoration: "none",
    position: "relative",
  }
  const [hov, setHov] = useState(false)
  const style = {
    ...base,
    ...(hov ? { borderColor: "#C8A23A", transform: "translateY(-2px)", boxShadow: "0 4px 14px rgba(200,162,58,0.2)", color: "#C8A23A" } : {}),
    ...(className.includes("menu-btn") ? { marginLeft: 0 } : {}),
  }
  const inner = (
    <>
      {children}
      {badge > 0 && (
        <span style={{
          position: "absolute", top: -2, right: -2,
          minWidth: 18, height: 18, padding: "0 3px",
          borderRadius: 999, fontSize: 9, fontWeight: 800,
          fontFamily: "'Inter',sans-serif",
          background: "linear-gradient(135deg,#D4AF37,#B8860B)",
          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
        }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </>
  )
  if (to) return (
    <Link to={to} title={title} style={style} className={className}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {inner}
    </Link>
  )
  return (
    <button onClick={onClick} title={title} style={style} className={className}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {inner}
    </button>
  )
}

/* ─────────────────────────────────────────
   SEARCH OVERLAY — expands from search icon
───────────────────────────────────────── */
function SearchOverlay({ products, navigate, onClose }) {
  const [q, setQ] = useState("")
  const [hits, setHits] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [onClose])

  const onChange = e => {
    setQ(e.target.value)
    if (e.target.value.trim().length >= 2 && products.length) {
      const lo = e.target.value.toLowerCase()
      setHits(products.filter(p =>
        p.name?.toLowerCase().includes(lo) || p.category?.toLowerCase().includes(lo)
      ).slice(0, 5))
    } else setHits([])
  }

  const go = e => {
    e?.preventDefault()
    if (q.trim()) {
      navigate(`/products?search=${encodeURIComponent(q.trim())}`)
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      ref={ref}
      style={{
        position: "fixed",
        top: 80,          /* exactly below 80px navbar */
        left: 0,
        right: 0,
        zIndex: 500,
        padding: "12px 16px",
        background: "#F8F5F0",
        borderBottom: "1px solid #E7DED1",
        boxShadow: "0 8px 24px rgba(44,36,27,0.12)",
      }}
    >
      <form onSubmit={go} style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
        <Search size={15} style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: "#8F857A", pointerEvents: "none",
        }} />
        <input
          autoFocus type="text" value={q} onChange={onChange}
          placeholder="Search gifts…"
          style={{
            width: "100%", paddingLeft: 42, paddingRight: q ? 38 : 16,
            paddingTop: 13, paddingBottom: 13,
            borderRadius: 999, border: "1.5px solid #E7DED1",
            background: "#FFFFFF", color: "#2C241B",
            fontSize: 15, fontFamily: "'Inter',sans-serif",
            outline: "none", boxShadow: "0 2px 12px rgba(44,36,27,0.08)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={e => { e.target.style.borderColor = "#C8A23A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,162,58,0.1)" }}
          onBlur={e => { e.target.style.borderColor = "#E7DED1"; e.target.style.boxShadow = "0 2px 12px rgba(44,36,27,0.08)" }}
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setHits([]) }}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#8F857A", background: "none", border: "none", cursor: "pointer" }}>
            <X size={14} />
          </button>
        )}
      </form>

      <AnimatePresence>
        {hits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              marginTop: 8,
              maxWidth: 640, margin: "8px auto 0",
              background: "#FFFFFF", border: "1px solid #E7DED1",
              borderRadius: 16, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(44,36,27,0.12)",
            }}>
            {hits.map(p => (
              <button key={p.id}
                onClick={() => { navigate(`/products/${p.id}`); onClose() }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", background: "none", border: "none",
                  textAlign: "left", cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8F5F0"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                {p.images?.[0] && (
                  <img src={p.images[0]} alt="" onError={e => e.target.style.display = "none"}
                    style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 8, border: "1px solid #E7DED1", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#2C241B", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: "#8F857A", fontFamily: "'Inter',sans-serif" }}>{p.category}</p>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#C8A23A", fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>
                  ₹{p.price?.toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   CATEGORIES DROPDOWN
───────────────────────────────────────── */
function CatDropdown({ categories, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.16 }}
      style={{
        position: "absolute", top: "calc(100% + 10px)", left: "50%",
        transform: "translateX(-50%)",
        minWidth: 220, background: "#FFFFFF",
        border: "1px solid #E7DED1", borderRadius: 16,
        boxShadow: "0 12px 40px rgba(44,36,27,0.12)",
        zIndex: 200, overflow: "hidden",
        paddingTop: 8, paddingBottom: 8,
      }}
    >
      <div style={{ padding: "6px 16px 10px", borderBottom: "1px solid #F3EEE6" }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8A23A", fontFamily: "'Inter',sans-serif" }}>
          Browse Categories
        </span>
      </div>
      {(categories.length > 0 ? categories : ["All Products"]).map(cat => (
        <Link
          key={cat}
          to={cat === "All Products" ? "/products" : `/products?category=${encodeURIComponent(cat)}`}
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: 14, fontFamily: "'Inter',sans-serif", color: "#6F655A", textDecoration: "none", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#2C241B"; e.currentTarget.style.background = "#F8F5F0" }}
          onMouseLeave={e => { e.currentTarget.style.color = "#6F655A"; e.currentTarget.style.background = "none" }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C8A23A", flexShrink: 0 }} />
          {cat}
        </Link>
      ))}
      <div style={{ borderTop: "1px solid #F3EEE6", marginTop: 4, padding: "8px 16px 4px" }}>
        <Link to="/products" onClick={onClose}
          style={{ fontSize: 12, fontWeight: 600, color: "#C8A23A", fontFamily: "'Inter',sans-serif", textDecoration: "none" }}
          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
          View all products →
        </Link>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   USER DROPDOWN
───────────────────────────────────────── */
function UserDropdown({ user, isAdmin, isOnAdmin, onSignOut, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 216, background: "#FFFFFF",
        border: "1px solid #E7DED1", borderRadius: 16,
        boxShadow: "0 12px 40px rgba(44,36,27,0.12)",
        zIndex: 200, overflow: "hidden",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3EEE6" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#2C241B", fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.user_metadata?.full_name || "Welcome back"}
        </p>
        <p style={{ fontSize: 11, color: "#8F857A", fontFamily: "'Inter',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
          {user.email}
        </p>
      </div>

      {[
        { to: "/profile",  icon: <User size={14} />,    label: "My Profile" },
        { to: "/orders",   icon: <Package size={14} />, label: "My Orders"  },
        { to: "/wishlist", icon: <Heart size={14} />,   label: "Wishlist"   },
      ].map(item => (
        <Link key={item.to} to={item.to} onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontSize: 14, color: "#6F655A", fontFamily: "'Inter',sans-serif", textDecoration: "none", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#2C241B"; e.currentTarget.style.background = "#F8F5F0" }}
          onMouseLeave={e => { e.currentTarget.style.color = "#6F655A"; e.currentTarget.style.background = "none" }}
        >
          <span style={{ color: "#C8A23A", display: "flex" }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}

      {isAdmin && (
        <Link to={isOnAdmin ? "/" : "/admin"} onClick={onClose}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontSize: 14, fontWeight: 600, color: "#C8A23A", fontFamily: "'Inter',sans-serif", textDecoration: "none", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#F8F5F0"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <Settings size={14} />
          {isOnAdmin ? "← User View" : "Admin Panel"}
        </Link>
      )}

      <div style={{ borderTop: "1px solid #F3EEE6", marginTop: 4 }}>
        <button onClick={onSignOut}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", fontSize: 14, color: "#6F655A", fontFamily: "'Inter',sans-serif", background: "none", border: "none", width: "100%", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#D9534F"; e.currentTarget.style.background = "#FFF5F5" }}
          onMouseLeave={e => { e.currentTarget.style.color = "#6F655A"; e.currentTarget.style.background = "none" }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </motion.div>
  )
}

/* ═════════════════════════════════════════
   MAIN NAVBAR
   Three-section flex layout:
     LEFT  20% — logo
     CENTER 60% — nav links
     RIGHT  20% — icons + CTA
═════════════════════════════════════════ */
export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [catOpen,     setCatOpen]     = useState(false)
  const [userOpen,    setUserOpen]    = useState(false)

  const { user, signOut }              = useAuthStore()
  const cartCount                      = useCartStore(s => s.getCount())
  const { products, loadProducts }     = useAdminStore()
  const { categories, loadCategories } = useCategoryStore()
  const navigate   = useNavigate()
  const { pathname }= useLocation()
  const userRef    = useRef(null)
  const isAdmin    = checkIsAdmin(user)
  const isOnAdmin  = pathname.startsWith("/admin")

  /* ── init ── */
  useEffect(() => { if (!products.length) loadProducts(); loadCategories() }, [])

  /* ── scroll listener → solid nav ── */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    const h = e => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out")
    navigate("/"); setUserOpen(false); setMenuOpen(false)
  }

  const closeAll = () => { setMenuOpen(false); setUserOpen(false); setSearchOpen(false); setCatOpen(false) }

  /* ── shared icon button style ── */
  const iconStyle = {
    width: 38, height: 38, borderRadius: "50%",
    background: "#FFFFFF", border: "1px solid #ECE5DA",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0, color: "#4A4036",
    boxShadow: "0 1px 6px rgba(44,36,27,0.07)",
    textDecoration: "none", transition: "all 0.22s ease",
  }

  /* ── nav bar background ── */
  const navStyle = {
    position: "sticky", top: 0, zIndex: 100,
    height: 80,
    background: scrolled ? "rgba(248,245,240,0.97)" : "#F8F5F0",
    borderBottom: "1px solid #E7DED1",
    backdropFilter: scrolled ? "blur(20px)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
    boxShadow: scrolled ? "0 2px 24px rgba(44,36,27,0.08)" : "none",
    transition: "all 0.4s ease",
  }

  /* ── nav link styles ── */
  const linkBase = {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontSize: 15, fontWeight: 500, fontFamily: "'Inter',sans-serif",
    letterSpacing: "0.01em", textDecoration: "none",
    padding: "6px 0", position: "relative",
    whiteSpace: "nowrap", cursor: "pointer",
    background: "none", border: "none",
    transition: "color 0.2s ease",
  }

  return (
    <>
      <nav style={navStyle}>
        {/* ── max-width container ── */}
        <div className="px-3 sm:px-5 lg:px-8 xl:px-10" style={{
          maxWidth: 1360, width: "100%",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          boxSizing: "border-box",
        }}>

          {/* ══════════════════════════════
              LEFT SECTION — Logo
          ══════════════════════════════ */}
          <div style={{
            flex: "0 0 auto",
            display: "flex", alignItems: "center",
          }}>
            <Link to="/" onClick={closeAll} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
              {/* Clipped V icon — only top portion of logo image */}
              <div style={{
                width: 52, height: 52,
                overflow: "hidden",
                flexShrink: 0,
                marginLeft: 8,
                display: "flex",
                alignItems: "flex-start",
              }}>
                <img
                  src="/logo.png"
                  alt="Vidhyrathi"
                  style={{ width: 52, height: "auto", display: "block", marginTop: "-4px" }}
                />
              </div>
              {/* Brand name text */}
              <div style={{ lineHeight: 1 }}>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#2C241B",
                  margin: 0,
                  lineHeight: 1.15,
                }}>Vidyarathi</p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C8A23A",
                  margin: 0,
                  marginTop: 3,
                }}>Personalized Gifts</p>
              </div>
            </Link>
          </div>

          {/* ══════════════════════════════
              CENTER SECTION — Nav Links (Desktop Only)
          ══════════════════════════════ */}
          <div className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-5" style={{
            flex: "1 1 auto",
          }}>
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.to ||
                (link.to !== "/" && pathname.startsWith(link.to.split("?")[0]))
              const color = isActive ? "#C8A23A" : "#4A4036"

              if (link.dropdown) {
                return (
                  <div key={link.label} style={{ position: "relative" }}
                    onMouseEnter={() => setCatOpen(true)}
                    onMouseLeave={() => setCatOpen(false)}>
                    <button
                      style={{ ...linkBase, fontSize: 13.5, color, gap: 3 }}
                      onMouseEnter={e => !isActive && (e.currentTarget.style.color = "#2C241B")}
                      onMouseLeave={e => !isActive && (e.currentTarget.style.color = color)}
                    >
                      {link.label}
                      <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: catOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                      {/* Gold underline */}
                      <span style={{
                        position: "absolute", bottom: 0, left: 0,
                        height: 1.5, borderRadius: 2, background: "#C8A23A",
                        width: isActive ? "100%" : "0%",
                        transition: "width 0.28s ease",
                      }} className="nav-underline" />
                    </button>
                    <AnimatePresence>
                      {catOpen && <CatDropdown categories={categories} onClose={() => { setCatOpen(false); closeAll() }} />}
                    </AnimatePresence>
                  </div>
                )
              }

              return (
                <div key={link.label} style={{ position: "relative" }}>
                  <Link
                    to={link.to} onClick={closeAll}
                    style={{ ...linkBase, fontSize: 13.5, color }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#2C241B"; e.currentTarget.querySelector(".nav-underline").style.width = "100%" } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = color; e.currentTarget.querySelector(".nav-underline").style.width = "0%" } }}
                  >
                    {link.label}
                    <span className="nav-underline" style={{
                      position: "absolute", bottom: 0, left: 0,
                      height: 1.5, borderRadius: 2, background: "#C8A23A",
                      width: isActive ? "100%" : "0%",
                      transition: "width 0.28s ease",
                    }} />
                  </Link>
                </div>
              )
            })}
          </div>

          {/* ══════════════════════════════
              RIGHT SECTION — Icons & Action
          ══════════════════════════════ */}
          <div style={{
            flex: "0 0 auto",
            display: "flex", alignItems: "center",
            justifyContent: "flex-end", gap: 4,
          }}>
            {/* Search */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button onClick={() => setSearchOpen(o => !o)} title="Search" style={iconStyle}>
                <Search size={17} />
              </button>
              <AnimatePresence>
                {searchOpen && <SearchOverlay products={products} navigate={navigate} onClose={() => setSearchOpen(false)} />}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to={user ? "/wishlist" : "/login"} title="Wishlist" style={iconStyle}>
              <Heart size={17} />
            </Link>

            {/* Cart */}
            <Link to="/cart" title="Cart" style={{ ...iconStyle, position: "relative" }}>
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -2, right: -2,
                  minWidth: 16, height: 16, padding: "0 3px",
                  borderRadius: 999, fontSize: 9, fontWeight: 800,
                  fontFamily: "'Inter',sans-serif",
                  background: "linear-gradient(135deg,#D4AF37,#B8860B)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Login (desktop only) */}
            {!user && (
              <Link to="/login" className="hidden lg:inline-block"
                style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Inter',sans-serif", color: "#4A4036", textDecoration: "none", padding: "0 4px", whiteSpace: "nowrap", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
                onMouseLeave={e => e.currentTarget.style.color = "#4A4036"}>
                Login
              </Link>
            )}

            {/* Avatar (desktop only) */}
            {user && (
              <div className="hidden lg:block" style={{ position: "relative", flexShrink: 0 }} ref={userRef}>
                <button onClick={() => setUserOpen(o => !o)} title="Account" style={{ ...iconStyle, overflow: "hidden", padding: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A23A" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ECE5DA" }}>
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    : <User size={17} style={{ color: "#4A4036" }} />}
                </button>
                <AnimatePresence>
                  {userOpen && <UserDropdown user={user} isAdmin={isAdmin} isOnAdmin={isOnAdmin} onSignOut={handleSignOut} onClose={() => setUserOpen(false)} />}
                </AnimatePresence>
              </div>
            )}

            {/* Admin (desktop only) */}
            {isAdmin && (
              <Link to={isOnAdmin ? "/" : "/admin"} className="hidden lg:inline-flex"
                style={{ fontSize: 11, fontWeight: 600, fontFamily: "'Inter',sans-serif", color: "#C8A23A", textDecoration: "none", padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(200,162,58,0.35)", whiteSpace: "nowrap", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(200,162,58,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {isOnAdmin ? "User" : "Admin"}
              </Link>
            )}

            {/* Customize CTA (tablet+ only) */}
            <Link to="/products" onClick={closeAll} className="hidden md:inline-flex"
              style={{ height: 40, padding: "0 18px", borderRadius: 999, background: "linear-gradient(135deg, #D4AF37, #B8860B)", color: "#FFFFFF", fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, alignItems: "center", justifyContent: "center" }}
              onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #E4C55A, #C9971A)"; e.currentTarget.style.transform = "translateY(-2px)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, #D4AF37, #B8860B)"; e.currentTarget.style.transform = "none" }}>
              Customize Gift
            </Link>

            {/* ── Hamburger — ALWAYS visible ── */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              title="Menu"
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "#FFFFFF", border: "1px solid #ECE5DA",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, flexGrow: 0,
                color: "#4A4036",
                boxShadow: "0 1px 6px rgba(44,36,27,0.07)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.color = "#C8A23A" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ECE5DA"; e.currentTarget.style.color = "#4A4036" }}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

          </div>
        </div>
      </nav>

      {/* ══════════════════════════════
          MOBILE MENU DRAWER
      ══════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              overflow: "hidden", position: "fixed",
              top: 80, left: 0, right: 0, zIndex: 99,
              background: "#FFFFFF",
              borderBottom: "1px solid #E7DED1",
              boxShadow: "0 8px 32px rgba(44,36,27,0.1)",
            }}
          >
            <div className="px-5 py-6 sm:px-10" style={{ maxWidth: 1280, margin: "0 auto" }}>

              {/* Mobile search */}
              <div style={{ position: "relative", marginBottom: 20 }}>
                <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#8F857A", pointerEvents: "none" }} />
                <input
                  type="text"
                  placeholder="Search personalised gifts…"
                  onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`); closeAll() } }}
                  style={{
                    width: "100%", paddingLeft: 42, paddingRight: 16,
                    paddingTop: 12, paddingBottom: 12,
                    borderRadius: 999, border: "1px solid #E7DED1",
                    background: "#F8F5F0", color: "#2C241B",
                    fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none",
                  }}
                  onFocus={e => e.target.style.borderColor = "#C8A23A"}
                  onBlur={e => e.target.style.borderColor = "#E7DED1"}
                />
              </div>

              {/* Nav links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {NAV_LINKS.map(link => (
                  <Link key={link.label} to={link.to} onClick={closeAll}
                    style={{
                      padding: "12px 4px", fontSize: 16, fontWeight: 500,
                      fontFamily: "'Inter',sans-serif", color: "#4A4036",
                      textDecoration: "none", borderBottom: "1px solid #F3EEE6",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
                    onMouseLeave={e => e.currentTarget.style.color = "#4A4036"}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Category quick links */}
              {categories.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C8A23A", fontFamily: "'Inter',sans-serif", marginBottom: 10 }}>
                    Categories
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {categories.slice(0, 8).map(cat => (
                      <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} onClick={closeAll}
                        style={{
                          padding: "6px 14px", borderRadius: 999,
                          border: "1px solid #E7DED1", background: "#F8F5F0",
                          fontSize: 13, fontFamily: "'Inter',sans-serif", color: "#6F655A",
                          textDecoration: "none", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.color = "#C8A23A" }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.color = "#6F655A" }}
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile CTAs */}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Link to="/products" onClick={closeAll}
                  style={{
                    flex: 1, height: 48, borderRadius: 999, textAlign: "center",
                    background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                    color: "#FFFFFF", fontSize: 14, fontWeight: 600,
                    fontFamily: "'Inter',sans-serif", textDecoration: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 3px 14px rgba(200,162,58,0.35)",
                  }}>
                  Customize Now
                </Link>
                {!user && (
                  <Link to="/login" onClick={closeAll}
                    style={{
                      flex: 1, height: 48, borderRadius: 999, textAlign: "center",
                      background: "transparent", color: "#8B5E3C",
                      fontSize: 14, fontWeight: 600,
                      fontFamily: "'Inter',sans-serif", textDecoration: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1.5px solid #8B5E3C",
                    }}>
                    Login
                  </Link>
                )}
                {user && (
                  <button onClick={handleSignOut}
                    style={{
                      flex: 1, height: 48, borderRadius: 999,
                      background: "transparent", color: "#D9534F",
                      fontSize: 14, fontWeight: 600,
                      fontFamily: "'Inter',sans-serif",
                      border: "1.5px solid #D9534F", cursor: "pointer",
                    }}>
                    Sign Out
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
