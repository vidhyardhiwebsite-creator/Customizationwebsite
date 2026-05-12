import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Heart, Search, Menu, X, User, LogOut, ChevronDown, Package, Settings } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { useCartStore } from "../store/cartStore"
import { CATEGORIES } from "../data/products"
import logoImg from "../assets/logo.png"
import toast from "react-hot-toast"
import { isAdmin as checkIsAdmin } from "./AdminRoute"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [catOpen, setCatOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { user, signOut } = useAuthStore()
  const cartCount = useCartStore(s => s.getCount())
  const navigate = useNavigate()
  const userRef = useRef(null)
  const isAdmin = checkIsAdmin(user)

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("touchstart", handler) }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false); setSearchQuery("")
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    navigate("/"); setUserOpen(false); setMenuOpen(false)
  }

  const closeAll = () => { setMenuOpen(false); setUserOpen(false) }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E8E0D5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeAll}>
            <img src={logoImg} alt="NaShe Jewels" className="h-10 w-10 rounded-full object-cover" />
            <div className="hidden sm:block">
              <span className="text-xl font-bold text-[#1B2B5E]" style={{ fontFamily: "Georgia, serif" }}>NaShe</span>
              <span className="text-xs text-[#C9956C] ml-1 tracking-widest uppercase">Jewels</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm font-medium transition-colors">All Jewelry</Link>
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-1 text-[#4A4A6A] hover:text-[#1B2B5E] text-sm font-medium transition-colors">
                Categories <ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#E8E0D5] rounded-xl shadow-lg py-2">
                    {CATEGORIES.map(cat => (
                      <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`}
                        className="block px-4 py-2 text-sm text-[#4A4A6A] hover:text-[#1B2B5E] hover:bg-[#FAF8F5] transition-colors"
                        onClick={() => setCatOpen(false)}>{cat}</Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/contact" className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm font-medium transition-colors">Contact</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Link to="/admin" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2B5E] text-white text-xs font-bold rounded-lg hover:bg-[#2A3F7E] transition-all">
                <Settings size={13} /> User Panel
              </Link>
            )}
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-[#4A4A6A] hover:text-[#1B2B5E] transition-colors p-1">
              <Search size={20} />
            </button>
            <Link to={user ? "/wishlist" : "/login"} className="text-[#4A4A6A] hover:text-[#1B2B5E] transition-colors p-1">
              <Heart size={20} />
            </Link>
            <Link to="/cart" className="relative text-[#4A4A6A] hover:text-[#1B2B5E] transition-colors p-1">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1B2B5E] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => setUserOpen(o => !o)} className="flex items-center gap-1 text-[#4A4A6A] hover:text-[#1B2B5E] transition-colors p-1">
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url} alt="avatar" className="w-7 h-7 rounded-full object-cover border-2 border-[#1B2B5E]" />
                    : <div className="w-7 h-7 rounded-full bg-[#1B2B5E] flex items-center justify-center"><User size={14} className="text-white" /></div>
                  }
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E8E0D5] rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#E8E0D5] mb-1">
                        <p className="text-[#1A1A2E] text-xs font-semibold truncate">{user.user_metadata?.full_name || user.user_metadata?.name || "User"}</p>
                        <p className="text-[#8A8AAA] text-xs truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4A4A6A] hover:text-[#1B2B5E] hover:bg-[#FAF8F5] transition-colors"><User size={14} /> Profile</Link>
                      <Link to="/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4A4A6A] hover:text-[#1B2B5E] hover:bg-[#FAF8F5] transition-colors"><Package size={14} /> My Orders</Link>
                      <Link to="/wishlist" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4A4A6A] hover:text-[#1B2B5E] hover:bg-[#FAF8F5] transition-colors"><Heart size={14} /> Wishlist</Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1B2B5E] hover:bg-[#FAF8F5] font-semibold transition-colors"><Settings size={14} /> User Panel</Link>
                      )}
                      <div className="border-t border-[#E8E0D5] mt-1 pt-1">
                        <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#4A4A6A] hover:text-red-500 hover:bg-red-50 w-full transition-colors"><LogOut size={14} /> Sign Out</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="text-sm px-4 py-1.5 bg-[#1B2B5E] text-white rounded-lg hover:bg-[#2A3F7E] transition-all font-medium">Login</Link>
            )}

            <button className="lg:hidden text-[#4A4A6A] hover:text-[#1B2B5E] p-1" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search jewelry..."
                  className="flex-1 bg-[#FAF8F5] border border-[#E8E0D5] rounded-lg px-4 py-2 text-sm text-[#1A1A2E] placeholder-[#8A8AAA] focus:outline-none focus:border-[#1B2B5E]" />
                <button type="submit" className="px-4 py-2 bg-[#1B2B5E] text-white rounded-lg text-sm font-medium hover:bg-[#2A3F7E] transition-colors">Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-[#E8E0D5] py-4">
              <div className="flex flex-col gap-1">
                <Link to="/" className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-2 px-1 font-medium" onClick={closeAll}>Home</Link>
                <Link to="/products" className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-2 px-1 font-medium" onClick={closeAll}>All Jewelry</Link>
                <p className="text-[#8A8AAA] text-xs uppercase tracking-wider px-1 mt-2 mb-1">Categories</p>
                {CATEGORIES.map(cat => (
                  <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-1.5 pl-3" onClick={closeAll}>{cat}</Link>
                ))}
                <Link to="/contact" className="text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-2 px-1 font-medium" onClick={closeAll}>Contact</Link>
                {user && (
                  <div className="border-t border-[#E8E0D5] mt-3 pt-3">
                    <p className="text-[#8A8AAA] text-xs uppercase tracking-wider px-1 mb-1">Account</p>
                    <Link to="/profile" className="flex items-center gap-2 text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-2 px-1" onClick={closeAll}><User size={15} /> Profile</Link>
                    <Link to="/orders" className="flex items-center gap-2 text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-2 px-1" onClick={closeAll}><Package size={15} /> My Orders</Link>
                    <Link to="/wishlist" className="flex items-center gap-2 text-[#4A4A6A] hover:text-[#1B2B5E] text-sm py-2 px-1" onClick={closeAll}><Heart size={15} /> Wishlist</Link>
                    {isAdmin && <Link to="/admin" className="flex items-center gap-2 text-[#1B2B5E] text-sm py-2 px-1 font-semibold" onClick={closeAll}><Settings size={15} /> User Panel</Link>}
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-red-500 text-sm py-2 px-1 w-full"><LogOut size={15} /> Sign Out</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
