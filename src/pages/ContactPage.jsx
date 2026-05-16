import { useState } from 'react'
import { Mail, Phone, Clock, MapPin } from 'lucide-react'

const WHATSAPP_NUMBER = "918639006849"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (name.trim().length < 3) e.name = "Name must be at least 3 characters"
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email address"
    if (!message.trim()) e.message = "Message is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const text = `Hi NaShe Jewels! 👋\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank")
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2" style={{ fontFamily: 'Georgia, serif' }}>Contact Us</h1>
      <p className="text-[#4A4A6A] mb-10">We'd love to hear from you. Reach out anytime.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {[
          { icon: <Mail size={20} />, label: 'Email', value: 'nashejewels@gmail.com' },
          { icon: <Phone size={20} />, label: 'Phone / WhatsApp', value: '+91 863 900 6849' },
          { icon: <Clock size={20} />, label: 'Hours', value: 'Mon–Sat, 10am–7pm IST' },
          { icon: <MapPin size={20} />, label: 'Location', value: 'India' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-[#E8E0D5] rounded-xl p-5 flex items-start gap-4 shadow-sm">
            <div className="text-[#1B2B5E] mt-0.5">{c.icon}</div>
            <div>
              <p className="text-[#8A8AAA] text-xs mb-1">{c.label}</p>
              <p className="text-[#1A1A2E] text-sm font-medium">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-4 mb-8">
        <a href="https://wa.me/918639006849" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#1ebe5d] transition-all">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </a>
        <a href="https://www.instagram.com/nashe.jewels" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Instagram
        </a>
      </div>

      <div className="bg-white border border-[#E8E0D5] rounded-2xl p-6 shadow-sm">
        <h2 className="text-[#1A1A2E] font-semibold mb-1">Send a Message</h2>
        <p className="text-[#8A8AAA] text-xs mb-4">Submitting will open WhatsApp with your message pre-filled.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#4A4A6A] mb-1 block font-medium">Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} minLength={3}
                className="w-full bg-[#FAF8F5] border border-[#E8E0D5] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]" placeholder="Your name (min 3 chars)" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs text-[#4A4A6A] mb-1 block font-medium">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E0D5] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E]" placeholder="your@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          <div>
            <label className="text-xs text-[#4A4A6A] mb-1 block font-medium">Message *</label>
            <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E8E0D5] rounded-lg px-3 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#1B2B5E] resize-none" placeholder="How can we help?" />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
          </div>
          <button type="submit" className="px-6 py-2.5 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1ebe5d] transition-all text-sm flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  )
}
