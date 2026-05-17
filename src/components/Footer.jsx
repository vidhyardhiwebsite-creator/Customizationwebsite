import { Link } from 'react-router-dom'
import { CATEGORIES } from '../data/products'
import { Mail, Phone, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1B2B5E] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[#C9956C] text-xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>✦ NaShe Jewels</h3>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">Premium handcrafted jewelry celebrating India's rich heritage. Every piece tells a story.</p>
            <div className="space-y-2 text-sm text-blue-200">
              <div className="flex items-center gap-2"><Mail size={13} className="text-[#C9956C]" /> nashejewels@gmail.com</div>
              <div className="flex items-center gap-2"><Phone size={13} className="text-[#C9956C]" /> +91 863 900 6849</div>
              <div className="flex items-center gap-2"><Clock size={13} className="text-[#C9956C]" /> Mon–Sat, 10am–7pm</div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Collections</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Shop</Link></li>
              <li><Link to="/orders" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">My Orders</Link></li>
              <li><Link to="/profile" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">My Account</Link></li>
              <li><Link to="/wishlist" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-policy" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Refund Policy</Link></li>
              <li><Link to="/privacy-policy" className="text-blue-200 hover:text-[#C9956C] text-sm transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2A3F7E] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-blue-300 text-xs">
          <span>© 2026 NaShe Jewels. All rights reserved. | Crafted with ♥ in India</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-[#C9956C] transition-colors">Privacy</Link>
            <Link to="/shipping-policy" className="hover:text-[#C9956C] transition-colors">Shipping</Link>
            <Link to="/refund-policy" className="hover:text-[#C9956C] transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
