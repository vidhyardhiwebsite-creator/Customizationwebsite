import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react"
import { useState } from "react"

const SocialSVG = {
  Instagram: () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  Facebook:  () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  YouTube:   () => <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>,
}

const COLS = [
  { heading: "Shop", links: [
    { label:"Photo Frames", to:"/products?category=Photo+Frames" },
    { label:"Mugs & Bottles", to:"/products?category=Mugs" },
    { label:"T-Shirts", to:"/products?category=T-Shirts" },
    { label:"Keychains", to:"/products?category=Keychains" },
    { label:"Wallets", to:"/products?category=Wallets" },
    { label:"Corporate Gifts", to:"/products?category=Corporate+Gifts" },
  ]},
  { heading: "Occasions", links: [
    { label:"Birthday Gifts", to:"/products?occasion=Birthday" },
    { label:"Anniversary", to:"/products?occasion=Anniversary" },
    { label:"Wedding Gifts", to:"/products?occasion=Wedding" },
    { label:"Festival Gifts", to:"/products?occasion=Festival" },
    { label:"Kids Gifts", to:"/products?occasion=Kids" },
    { label:"Bulk Orders", to:"/contact" },
  ]},
  { heading: "Support", links: [
    { label:"Track My Order", to:"/orders" },
    { label:"Contact Us", to:"/contact" },
    { label:"Shipping Policy", to:"/shipping-policy" },
    { label:"Refund Policy", to:"/refund-policy" },
    { label:"Privacy Policy", to:"/privacy-policy" },
  ]},
]

export default function Footer() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  const handleSub = e => {
    e.preventDefault()
    if (email.trim()) { setDone(true); setEmail(""); setTimeout(() => setDone(false), 4000) }
  }

  return (
    <footer style={{ background: "#2C241B" }}>
      {/* Newsletter stripe */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="container-lux section-gap-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <span className="eyebrow" style={{ color:"#C8A23A" }}>Stay Connected</span>
              <h3 className="font-playfair font-bold text-white text-[1.6rem] leading-tight">
                Join Our Gifting Community
              </h3>
              <p className="font-inter text-[14px] mt-2" style={{ color:"rgba(255,255,255,0.5)" }}>
                Exclusive offers, new arrivals & personalization inspiration.
              </p>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[420px]">
              {done ? (
                <div className="flex items-center gap-2 px-6 py-3 rounded-2xl" style={{ background:"rgba(200,162,58,0.15)", border:"1px solid rgba(200,162,58,0.3)", color:"#C8A23A" }}>
                  <span className="font-inter font-semibold text-[14px]">? Welcome to the Vidhyrathi family!</span>
                </div>
              ) : (
                <form onSubmit={handleSub} className="flex gap-3">
                  <div className="flex-1 relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"rgba(255,255,255,0.3)" }}/>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required
                      className="w-full pl-11 pr-4 py-3 rounded-full font-inter text-[14px] focus:outline-none transition-all"
                      style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", color:"#FFFFFF" }}
                      onFocus={e => e.target.style.borderColor = "rgba(200,162,58,0.6)"}
                      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}/>
                  </div>
                  <button type="submit" className="btn-primary flex-shrink-0" style={{ height:48 }}>Subscribe</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="container-lux section-gap-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center mb-5">
              <img
                src="/logo.png"
                alt="Vidhyrathi"
                style={{
                  height: 60,
                  width: "auto",
                  maxWidth: 180,
                  objectFit: "contain",
                  objectPosition: "left center",
                  display: "block",
                  borderRadius: 8,
                  padding: "4px 8px",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </Link>
            <p className="font-inter text-[14px] leading-relaxed mb-6 max-w-xs" style={{ color:"rgba(255,255,255,0.5)" }}>
              India's premium personalized gifting brand. Every gift we craft carries a story, a memory, and a lifetime of love.
            </p>
            <div className="space-y-3 mb-7">
              {[{ icon:<Phone size={13}/>, text:"+91 98765 43210", href:"tel:+919876543210" },
                { icon:<Mail size={13}/>, text:"hello@vidhyrathi.com", href:"mailto:hello@vidhyrathi.com" },
                { icon:<MapPin size={13}/>, text:"India � Shipped Nationwide" }
              ].map((c,i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"rgba(200,162,58,0.15)" }}>
                    <span style={{ color:"#C8A23A" }}>{c.icon}</span>
                  </div>
                  {c.href
                    ? <a href={c.href} className="font-inter text-[13px] transition-colors" style={{ color:"rgba(255,255,255,0.5)" }} onMouseEnter={e=>e.target.style.color="#C8A23A"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.5)"}>{c.text}</a>
                    : <span className="font-inter text-[13px]" style={{ color:"rgba(255,255,255,0.5)" }}>{c.text}</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {[{ S:SocialSVG.Instagram, href:"https://instagram.com", label:"Instagram" },
                { S:SocialSVG.Facebook,  href:"https://facebook.com",  label:"Facebook"  },
                { S:SocialSVG.YouTube,   href:"https://youtube.com",   label:"YouTube"   },
              ].map(({ S, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)" }}
                  onMouseEnter={e=>{e.currentTarget.style.color="#C8A23A";e.currentTarget.style.borderColor="rgba(200,162,58,0.4)"}}
                  onMouseLeave={e=>{e.currentTarget.style.color="rgba(255,255,255,0.5)";e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"}}>
                  <S/>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {COLS.map(col => (
            <div key={col.heading}>
              <h4 className="font-inter font-semibold text-white text-[14px] mb-5 tracking-wide">{col.heading}</h4>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to}
                      className="flex items-center gap-1.5 font-inter text-[13px] transition-colors group"
                      style={{ color:"rgba(255,255,255,0.45)" }}
                      onMouseEnter={e=>e.currentTarget.style.color="#C8A23A"}
                      onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.45)"}>
                      <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color:"#C8A23A" }}/>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="container-lux py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-inter text-[12px]" style={{ color:"rgba(255,255,255,0.3)" }}>
            � {new Date().getFullYear()} Vidhyrathi. All rights reserved. Made with ? in India.
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color:"rgba(255,255,255,0.25)" }}>Secure Payments</span>
            {["UPI", "VISA", "MC", "NB", "GPay"].map(p => (
              <span key={p} className="px-2 py-0.5 rounded font-inter text-[9px] font-bold tracking-wide"
                style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)" }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}


