import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Truck, Gift, Sparkles } from 'lucide-react'
import { getSetting } from '../services/settingsService'

// No emojis — use Lucide icons instead to avoid black-box rendering
const DEFAULT_OFFERS = [
  { id: 1, text: 'Free Shipping on all orders across India!',      icon: 'truck',    link: '/products' },
  { id: 2, text: 'New Personalised Gifts Collection — Shop Now',   icon: 'gift',     link: '/products?tags=gifting' },
  { id: 3, text: 'Use code VR10 for 10% off on your first order',  icon: 'sparkles', link: '/products' },
]

const ICON_MAP = {
  truck:    <Truck    size={13} />,
  gift:     <Gift     size={13} />,
  sparkles: <Sparkles size={13} />,
}

export default function OfferBanner() {
  const [offers,  setOffers]  = useState(DEFAULT_OFFERS)
  const [visible, setVisible] = useState(true)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    getSetting('offer_banner').then(val => {
      if (val) {
        try {
          const parsed = JSON.parse(val)
          if (Array.isArray(parsed) && parsed.length > 0) setOffers(parsed)
        } catch {}
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!visible || offers.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % offers.length), 4000)
    return () => clearInterval(t)
  }, [visible, offers.length])

  if (!visible) return null

  const offer = offers[current]

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(90deg, #A87A10, #C8A23A, #A87A10)',
      overflow: 'hidden',
    }}>
      {/* Text row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '9px 48px',
        minHeight: 38,
      }}>
        <AnimatePresence mode="wait">
          <motion.a
            key={offer.id}
            href={offer.link}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '80vw',
            }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
          >
            {/* Icon from map if available, fallback to nothing */}
            <span style={{ flexShrink: 0, display: 'flex', color: 'rgba(255,255,255,0.85)' }}>
              {ICON_MAP[offer.icon] || ICON_MAP.gift}
            </span>
            {offer.text}
          </motion.a>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      {offers.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: 3,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 4,
        }}>
          {offers.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 16 : 5,
                height: 3,
                borderRadius: 999,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                background: i === current ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Close button */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Close banner"
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          borderRadius: 999,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#FFFFFF'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
      >
        <X size={14} />
      </button>
    </div>
  )
}
