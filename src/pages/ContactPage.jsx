import { Mail, Phone, Clock, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Contact Us</h1>
      <p className="text-gray-400 mb-10">We'd love to hear from you. Reach out anytime.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {[
          { icon: <Mail size={20} />, label: 'Email', value: 'support@nashejewels.in' },
          { icon: <Phone size={20} />, label: 'Phone', value: '+91 98765 43210' },
          { icon: <Clock size={20} />, label: 'Hours', value: 'Mon–Sat, 10am–7pm IST' },
          { icon: <MapPin size={20} />, label: 'Location', value: 'India' },
        ].map((c, i) => (
          <div key={i} className="bg-[#111] border border-[#D4AF37]/10 rounded-xl p-5 flex items-start gap-4">
            <div className="text-[#D4AF37] mt-0.5">{c.icon}</div>
            <div>
              <p className="text-gray-400 text-xs mb-1">{c.label}</p>
              <p className="text-white text-sm">{c.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[#111] border border-[#D4AF37]/20 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Send a Message</h2>
        <form className="space-y-4" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Name</label>
              <input className="w-full bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]" placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" className="w-full bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]" placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Message</label>
            <textarea rows={4} className="w-full bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] resize-none" placeholder="How can we help?" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F0D060] transition-all text-sm">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
