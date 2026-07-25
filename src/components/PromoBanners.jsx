import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getSetting } from "../services/settingsService"

const DEFAULT_BANNERS = [
  { id: 1, badge: "LIMITED TIME", title: "Custom Photo Gifts", subtitle: "Up to 30% Off", desc: "Personalized mugs, frames & more", price: "349", originalPrice: "499", cta: "Shop Now", link: "/products?category=Mugs", bg: "from-[#004d40] to-[#00695c]", accent: "#4DB6AC", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&q=80" },
  { id: 2, badge: "NEW ARRIVALS", title: "Photo Frames", subtitle: "Starting ₹399", desc: "Acrylic, MDF & Wood options", price: "399", originalPrice: "", cta: "Explore", link: "/products?category=Photo+Frames", bg: "from-[#0a001a] to-[#1f003d]", accent: "#C084FC", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80" },
  { id: 3, badge: "BESTSELLER", title: "T-Shirts", subtitle: "Custom Printed", desc: "Your photo on premium fabric", price: "499", originalPrice: "", cta: "View Collection", link: "/products?category=T-Shirts", bg: "from-[#001a0a] to-[#003d1f]", accent: "#4ADE80", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80" },
  { id: 4, badge: "FREE SHIPPING", title: "Free Shipping", subtitle: "On All Orders", desc: "No minimum order value", price: "", originalPrice: "", cta: "Shop All", link: "/products", bg: "from-[#1a0a0a] to-[#3d0000]", accent: "#F87171", image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&q=80" },
]

export default function PromoBanners() {
  const [banners, setBanners] = useState(DEFAULT_BANNERS)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    getSetting("promo_banners").then(val => {
      if (val) { try { const p = JSON.parse(val); if (Array.isArray(p) && p.length) setBanners(p) } catch {} }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (paused || banners.length <= 1) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % banners.length), 4000)
    return () => clearInterval(timerRef.current)
  }, [paused, banners.length])

  const go = (dir) => { clearInterval(timerRef.current); setCurrent(c => (c + dir + banners.length) % banners.length) }

  const banner = banners[current]

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div
        className="relative rounded-2xl overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`bg-gradient-to-r ${banner.bg} flex items-center justify-between min-h-[140px] sm:min-h-[170px] px-5 sm:px-8 py-5 gap-4`}
          >
            {/* Left content */}
            <div className="flex-1 min-w-0">
              <span className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-2"
                style={{ background: banner.accent + "25", color: banner.accent, border: `1px solid ${banner.accent}50` }}>
                {banner.badge}
              </span>
              <h3 className="text-white text-xl sm:text-2xl font-bold leading-tight">{banner.title}</h3>
              <p className="font-bold text-base sm:text-lg mt-0.5" style={{ color: banner.accent }}>{banner.subtitle}</p>
              {banner.desc && <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{banner.desc}</p>}

              {/* Price display */}
              {banner.price && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-white font-bold text-lg">₹{Number(banner.price).toLocaleString("en-IN")}</span>
                  {banner.originalPrice && (
                    <span className="text-gray-400 text-sm line-through">₹{Number(banner.originalPrice).toLocaleString("en-IN")}</span>
                  )}
                  {banner.price && banner.originalPrice && (
                    <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                      style={{ background: banner.accent + "30", color: banner.accent }}>
                      {Math.round((1 - banner.price / banner.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              )}

              {/* CTA Button using React Router Link */}
              <Link
                to={banner.link || "/products"}
                className="inline-flex items-center gap-1.5 mt-3 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
                style={{ background: banner.accent, color: "#000" }}
              >
                {banner.cta || "Shop Now"} →
              </Link>
            </div>

            {/* Right image */}
            {banner.image && (
              <div className="flex-shrink-0 w-28 h-28 sm:w-40 sm:h-36 rounded-xl overflow-hidden border-2 shadow-lg"
                style={{ borderColor: banner.accent + "40" }}>
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = "none" }} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Arrows */}
        <button onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all">
          <ChevronRight size={16} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === current ? "20px" : "6px", background: i === current ? banner.accent : "rgba(255,255,255,0.3)" }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
