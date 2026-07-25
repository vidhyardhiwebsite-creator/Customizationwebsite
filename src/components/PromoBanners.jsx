import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { getSetting } from "../services/settingsService"

const DEFAULT_BANNERS = [
  {
    id: 1,
    badge: "LIMITED TIME",
    title: "Custom Photo Gifts",
    subtitle: "Up to 30% Off",
    desc: "Personalized mugs, frames & more",
    price: "349",
    originalPrice: "499",
    cta: "Shop Now",
    link: "/products?category=Mugs",
    bgFrom: "#FFF0E0",
    bgTo: "#FFD9A8",
    accent: "#C8A23A",
    textColor: "#2C241B",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80",
  },
  {
    id: 2,
    badge: "NEW ARRIVALS",
    title: "Photo Frames",
    subtitle: "Starting ₹399",
    desc: "Acrylic, MDF & Wood options",
    price: "399",
    originalPrice: "",
    cta: "Explore",
    link: "/products?category=Photo+Frames",
    bgFrom: "#FDE8F0",
    bgTo: "#F9C8D8",
    accent: "#D96B8A",
    textColor: "#2C241B",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
  },
  {
    id: 3,
    badge: "BESTSELLER",
    title: "Custom T-Shirts",
    subtitle: "Premium Print Quality",
    desc: "Your photo on premium fabric",
    price: "499",
    originalPrice: "",
    cta: "View Collection",
    link: "/products?category=T-Shirts",
    bgFrom: "#FFF8E1",
    bgTo: "#FFE082",
    accent: "#B8860B",
    textColor: "#2C241B",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
  },
  {
    id: 4,
    badge: "FREE SHIPPING",
    title: "Free Shipping",
    subtitle: "On All Orders",
    desc: "No minimum order value — always",
    price: "",
    originalPrice: "",
    cta: "Shop All",
    link: "/products",
    bgFrom: "#E8F5E9",
    bgTo: "#C8E6C9",
    accent: "#2E7D32",
    textColor: "#1B3A1F",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80",
  },
]

export default function PromoBanners() {
  const [banners, setBanners] = useState(DEFAULT_BANNERS)
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    getSetting("promo_banners").then(val => {
      if (val) {
        try {
          const p = JSON.parse(val)
          if (Array.isArray(p) && p.length) setBanners(p)
        } catch {}
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (paused || banners.length <= 1) return
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % banners.length), 4500)
    return () => clearInterval(timerRef.current)
  }, [paused, banners.length])

  const go = dir => {
    clearInterval(timerRef.current)
    setCurrent(c => (c + dir + banners.length) % banners.length)
  }

  const banner = banners[current]

  return (
    <section style={{ padding: "16px 0" }}>
      <div
        className="container-lux"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="relative rounded-[24px] overflow-hidden shadow-warm-md" style={{ border: "1px solid #E7DED1" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: `linear-gradient(135deg, ${banner.bgFrom || "#FFF0E0"} 0%, ${banner.bgTo || "#FFD9A8"} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: "clamp(140px, 22vw, 190px)",
                padding: "clamp(20px, 4vw, 36px) clamp(20px, 5vw, 48px)",
                gap: "clamp(12px, 3vw, 32px)",
                position: "relative",
              }}
            >
              {/* Decorative shimmer line */}
              <div style={{
                position: "absolute",
                top: 0, left: "10%", right: "10%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${banner.accent}60, transparent)`,
                pointerEvents: "none",
              }} />

              {/* Left content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Badge */}
                <span style={{
                  display: "inline-block",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "4px 12px",
                  borderRadius: 999,
                  marginBottom: 10,
                  background: `${banner.accent}18`,
                  border: `1px solid ${banner.accent}45`,
                  color: banner.accent,
                }}>
                  {banner.badge}
                </span>

                {/* Title */}
                <h3 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "clamp(18px, 3.5vw, 28px)",
                  lineHeight: 1.2,
                  color: banner.textColor || "#2C241B",
                  marginBottom: 4,
                }}>
                  {banner.title}
                </h3>

                {/* Subtitle */}
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(13px, 2vw, 17px)",
                  color: banner.accent,
                  marginBottom: 4,
                }}>
                  {banner.subtitle}
                </p>

                {/* Description */}
                {banner.desc && (
                  <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(11px, 1.5vw, 13px)",
                    color: banner.textColor === "#2C241B" ? "#6F655A" : "rgba(0,0,0,0.55)",
                    marginBottom: 10,
                  }}>
                    {banner.desc}
                  </p>
                )}

                {/* Price */}
                {banner.price && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 800,
                      fontSize: "clamp(16px, 2.5vw, 22px)",
                      color: banner.textColor || "#2C241B",
                    }}>
                      ₹{Number(banner.price).toLocaleString("en-IN")}
                    </span>
                    {banner.originalPrice && (
                      <>
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "clamp(12px, 1.5vw, 14px)",
                          color: "#8F857A",
                          textDecoration: "line-through",
                        }}>
                          ₹{Number(banner.originalPrice).toLocaleString("en-IN")}
                        </span>
                        <span style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: `${banner.accent}20`,
                          color: banner.accent,
                          border: `1px solid ${banner.accent}40`,
                        }}>
                          {Math.round((1 - banner.price / banner.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* CTA */}
                <Link
                  to={banner.link || "/products"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 22px",
                    borderRadius: 999,
                    background: `linear-gradient(135deg, ${banner.accent}, ${banner.accent}CC)`,
                    color: "#FFFFFF",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textDecoration: "none",
                    boxShadow: `0 4px 16px ${banner.accent}40`,
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${banner.accent}55` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 16px ${banner.accent}40` }}
                >
                  {banner.cta || "Shop Now"} <ArrowRight size={13} />
                </Link>
              </div>

              {/* Right image */}
              {banner.image && (
                <div style={{
                  flexShrink: 0,
                  width: "clamp(90px, 18vw, 160px)",
                  height: "clamp(90px, 18vw, 160px)",
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `2px solid ${banner.accent}35`,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.10)`,
                }}>
                  <img
                    src={banner.image}
                    alt={banner.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none" }}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={() => go(-1)}
            style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.85)", border: "1px solid #E7DED1",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#2C241B", boxShadow: "0 2px 8px rgba(44,36,27,0.12)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.color = "#C8A23A" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.color = "#2C241B" }}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => go(1)}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.85)", border: "1px solid #E7DED1",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#2C241B", boxShadow: "0 2px 8px rgba(44,36,27,0.12)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#C8A23A"; e.currentTarget.style.color = "#C8A23A" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.color = "#2C241B" }}
          >
            <ChevronRight size={15} />
          </button>

          {/* Dots */}
          <div style={{
            position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 6,
          }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  height: 6, borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                  width: i === current ? 20 : 6,
                  background: i === current ? banner.accent : `${banner.accent}50`,
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
