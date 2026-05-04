import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/products'
import { Mail, Phone, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#D4AF37]/20 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[#D4AF37] text-xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>✦ NaShe Jewels</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">Premium handcrafted jewelry celebrating India's rich heritage. Every piece tells a story.</p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2"><Mail size={13} className="text-[#D4AF37]" /> support@nashejewels.in</div>
              <div className="flex items-center gap-2"><Phone size={13} className="text-[#D4AF37]" /> +91 98765 43210</div>
              <div className="flex items-center gap-2"><Clock size={13} className="text-[#D4AF37]" /> Mon–Sat, 10am–7pm</div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Shop</Link></li>
              <li><Link to="/orders" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">My Account</Link></li>
              <li><Link to="/wishlist" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Refund Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Stay Updated</h4>
            <p className="text-gray-500 text-xs mb-3">Get new arrivals and exclusive offers.</p>
            <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-[#1A1A1A] border border-[#D4AF37]/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
              />
              <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black text-sm font-semibold rounded-lg hover:bg-[#F0D060] transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#D4AF37]/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-600 text-xs">
          <span>© 2024 NaShe Jewels. All rights reserved. | Crafted with ♥ in India</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">Privacy</Link>
            <Link to="/shipping-policy" className="hover:text-[#D4AF37] transition-colors">Shipping</Link>
            <Link to="/refund-policy" className="hover:text-[#D4AF37] transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
