import { useState } from 'react'
import { Mail, Phone, Clock, MapPin, Send } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const WHATSAPP = "919876543210"

const CONTACT_INFO = [
  { icon: <Mail size={20} />,    label: "Email",            value: "hello@vidhyrathi.com",  href: "mailto:hello@vidhyrathi.com" },
  { icon: <Phone size={20} />,   label: "Phone / WhatsApp", value: "+91 98765 43210",        href: "tel:+919876543210" },
  { icon: <Clock size={20} />,   label: "Working Hours",    value: "Mon–Sat, 10am–7pm IST",  href: null },
  { icon: <MapPin size={20} />,  label: "Location",         value: "India · Shipped Nationwide", href: null },
]

const WA_ICON = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const IG_ICON = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export default function ContactPage() {
  const [form, setForm]   = useState({ name: "", email: "", message: "" })
  const [errors, setErrors] = useState({})
  const [sent, setSent]   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3) e.name = "Minimum 3 characters"
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email"
    if (!form.message.trim()) e.message = "Please write a message"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!validate()) return
    const text = `Hi Vidhyrathi! 👋\n\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank")
    setSent(true)
    setForm({ name: "", email: "", message: "" })
    setTimeout(() => setSent(false), 5000)
  }

  /* ── shared input style ── */
  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: "1.5px solid #E7DED1",
    background: "#FDFCFB",
    color: "#2C241B",
    fontSize: 15,
    fontFamily: "'Inter',sans-serif",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  }

  return (
    <>
      <Helmet>
        <title>Contact Us — Vidhyrathi</title>
        <meta name="description" content="Get in touch with Vidhyrathi for personalised gifting enquiries, bulk orders, and corporate gifting solutions." />
      </Helmet>

      <div style={{ background: "#F8F5F0", minHeight: "100vh" }}>

        {/* ── Page header ── */}
        <div style={{ background: "#F3EEE6", borderBottom: "1px solid #E7DED1" }}>
          <div className="container-lux" style={{ paddingTop: 56, paddingBottom: 56 }}>
            <span className="eyebrow" style={{ display: "block", marginBottom: 12 }}>Get In Touch</span>
            <h1 className="heading-xl" style={{ marginBottom: 12 }}>
              Contact <span className="text-gold-accent">Us</span>
            </h1>
            <p className="body-lg" style={{ maxWidth: 480 }}>
              We'd love to hear from you. Reach out for personalised gifting, bulk orders, or any questions.
            </p>
          </div>
        </div>

        <div className="container-lux" style={{ paddingTop: 48, paddingBottom: 80 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 32,
            alignItems: "start",
          }}>

            {/* ── LEFT: contact info + social ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              {/* Info cards — 1 col on mobile, 2 col on sm+ */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
                marginBottom: 28,
              }}>
                {CONTACT_INFO.map((c, i) => (
                  <div key={i} style={{
                    background: "#FFFFFF",
                    border: "1px solid #E7DED1",
                    borderRadius: 16,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    gap: 14,
                    boxShadow: "0 2px 12px rgba(44,36,27,0.05)",
                    transition: "box-shadow 0.25s, border-color 0.25s",
                    minWidth: 0,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(200,162,58,0.35)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(44,36,27,0.09)" }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#E7DED1"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(44,36,27,0.05)" }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: "rgba(200,162,58,0.1)",
                      border: "1px solid rgba(200,162,58,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#C8A23A", flexShrink: 0,
                    }}>
                      {c.icon}
                    </div>
                    {/* Text */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8F857A", marginBottom: 4, margin: "0 0 4px" }}>
                        {c.label}
                      </p>
                      {c.href ? (
                        <a href={c.href} style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#2C241B", textDecoration: "none", wordBreak: "break-word" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#C8A23A"}
                          onMouseLeave={e => e.currentTarget.style.color = "#2C241B"}>
                          {c.value}
                        </a>
                      ) : (
                        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#2C241B", margin: 0, wordBreak: "break-word" }}>{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social buttons */}
              <div style={{ marginBottom: 32 }}>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8F857A", marginBottom: 14 }}>
                  Connect With Us
                </p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 999,
                      background: "#25D366", color: "#FFFFFF",
                      fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14,
                      textDecoration: "none", transition: "all 0.2s",
                      boxShadow: "0 3px 12px rgba(37,211,102,0.3)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,211,102,0.4)" }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(37,211,102,0.3)" }}>
                    <WA_ICON /> WhatsApp
                  </a>
                  <a href="https://www.instagram.com/vidhyrathi" target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "10px 20px", borderRadius: 999,
                      background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                      color: "#FFFFFF",
                      fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14,
                      textDecoration: "none", transition: "all 0.2s",
                      boxShadow: "0 3px 12px rgba(214,36,159,0.25)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(214,36,159,0.35)" }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 12px rgba(214,36,159,0.25)" }}>
                    <IG_ICON /> Instagram
                  </a>
                </div>
              </div>

              {/* Working note */}
              <div style={{
                padding: "18px 20px", borderRadius: 16,
                background: "rgba(200,162,58,0.07)",
                border: "1px solid rgba(200,162,58,0.2)",
              }}>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6F655A", lineHeight: 1.65, margin: 0 }}>
                  💛 We typically respond within <strong style={{ color: "#A88422" }}>2–4 hours</strong> on WhatsApp during working hours. For bulk &amp; corporate orders, expect a detailed quote within 24 hours.
                </p>
              </div>
            </motion.div>

            {/* ── RIGHT: Message form ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div style={{
                background: "#FFFFFF",
                border: "1px solid #E7DED1",
                borderRadius: 20,
                padding: "clamp(24px, 5vw, 40px) clamp(20px, 4vw, 36px)",
                boxShadow: "0 4px 32px rgba(44,36,27,0.08)",
              }}>
                {/* Top gold line */}
                <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #C8A23A, transparent)", marginBottom: 28 }} />

                <h2 className="heading-md" style={{ marginBottom: 6 }}>Send a Message</h2>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#8F857A", marginBottom: 28, lineHeight: 1.6 }}>
                  Submitting will open WhatsApp with your message pre-filled.
                </p>

                {sent && (
                  <div style={{ padding: "14px 18px", borderRadius: 12, background: "rgba(46,125,50,0.08)", border: "1px solid rgba(46,125,50,0.25)", marginBottom: 24 }}>
                    <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#2E7D32", fontWeight: 600, margin: 0 }}>
                      ✓ WhatsApp opened! We'll reply to you shortly.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Name + Email row — stacks on mobile */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 16 }}>
                    <div>
                      <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#6F655A", display: "block", marginBottom: 6 }}>
                        Name <span style={{ color: "#D9534F" }}>*</span>
                      </label>
                      <input value={form.name} onChange={e => set("name", e.target.value)}
                        placeholder="Your name" style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = "#C8A23A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,162,58,0.1)" }}
                        onBlur={e => { e.target.style.borderColor = errors.name ? "#D9534F" : "#E7DED1"; e.target.style.boxShadow = "none" }} />
                      {errors.name && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#D9534F", marginTop: 4 }}>{errors.name}</p>}
                    </div>
                    <div>
                      <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#6F655A", display: "block", marginBottom: 6 }}>
                        Email
                      </label>
                      <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                        placeholder="your@email.com" style={inputStyle}
                        onFocus={e => { e.target.style.borderColor = "#C8A23A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,162,58,0.1)" }}
                        onBlur={e => { e.target.style.borderColor = errors.email ? "#D9534F" : "#E7DED1"; e.target.style.boxShadow = "none" }} />
                      {errors.email && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#D9534F", marginTop: 4 }}>{errors.email}</p>}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, color: "#6F655A", display: "block", marginBottom: 6 }}>
                      Message <span style={{ color: "#D9534F" }}>*</span>
                    </label>
                    <textarea rows={5} value={form.message} onChange={e => set("message", e.target.value)}
                      placeholder="Tell us how we can help — personalised gifts, bulk orders, corporate gifting..."
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                      onFocus={e => { e.target.style.borderColor = "#C8A23A"; e.target.style.boxShadow = "0 0 0 3px rgba(200,162,58,0.1)" }}
                      onBlur={e => { e.target.style.borderColor = errors.message ? "#D9534F" : "#E7DED1"; e.target.style.boxShadow = "none" }} />
                    {errors.message && <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#D9534F", marginTop: 4 }}>{errors.message}</p>}
                  </div>

                  {/* Submit */}
                  <button type="submit" className="btn-primary" style={{ height: 52, fontSize: 15, borderRadius: 999, gap: 10 }}>
                    <WA_ICON /> Send via WhatsApp
                  </button>

                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#8F857A", textAlign: "center", margin: 0 }}>
                    Your message will open directly in WhatsApp.
                  </p>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  )
}
