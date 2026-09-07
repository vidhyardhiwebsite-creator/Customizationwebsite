import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import { useWishlistStore } from '../store/wishlistStore'
import { formatINR } from '../utils/format'
import toast from 'react-hot-toast'

const isVideo = url => url && /\.(mp4|mov|webm|ogg)(\?|$)/i.test(url)
const FB = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80'

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const { user } = useAuthStore()
  const { addToCart } = useCartStore()
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)

  const handleCart = async e => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { toast.error('Please login to add to cart'); return }
    try { await addToCart(product, user.id); toast.success('Added to cart!') }
    catch(err) { toast.error(err.message || 'Failed') }
  }
  const handleWish = async e => {
    e.preventDefault(); e.stopPropagation()
    if (!user) { toast.error('Please login'); return }
    const added = await toggleWishlist(product, user.id)
    toast.success(added ? 'Saved to wishlist' : 'Removed from wishlist')
  }

  const media = product.images?.[0] || FB
  const mediaIsVideo = isVideo(media)

  return (
    <motion.div
      whileHover={{ y:-6 }}
      transition={{ duration:0.3, ease:[0.25,0.46,0.45,0.94] }}
      onHoverStart={()=>setHovered(true)}
      onHoverEnd={()=>setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
      style={{ border: '1px solid #E7DED1' }}
    >
      <Link to={`/products/${product.id}`} className="flex flex-col flex-1">
        {/* ── Image ── */}
        <div className="relative overflow-hidden bg-[#F8F5F0]" style={{ aspectRatio:"1" }}>
          {mediaIsVideo ? (
            <video src={media} muted loop playsInline autoPlay
              className="w-full h-full object-cover"/>
          ) : (
            <img src={media} alt={product.name} loading="lazy"
              className="w-full h-full object-cover"
              onError={e=>e.target.src=FB}/>
          )}

          {/* Stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <span className="text-sm font-bold text-[#8F857A] uppercase tracking-wider">Out of Stock</span>
            </div>
          )}

          {/* Price badge - top left */}
          <div className="absolute top-3 left-3 z-10 bg-white px-3 py-1.5 rounded-lg shadow-md">
            <span className="font-bold text-sm text-[#2C241B]">{formatINR(product.price)}</span>
          </div>

          {/* Wishlist - top right */}
          <button onClick={handleWish}
            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 shadow-md">
            <Heart size={16} className={wishlisted?"fill-[#D9534F] text-[#D9534F]":"text-[#8F857A]"}/>
          </button>
        </div>

        {/* ── Info ── */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Product name */}
          <h3 className="font-medium text-[15px] text-[#2C241B] leading-relaxed mb-3 line-clamp-2 min-h-[3em]">
            {product.name}
          </h3>
          
          {/* Rating - centered row */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className="fill-[#FFB800] text-[#FFB800]"/>
            ))}
            <span className="text-sm text-[#2C241B] font-medium ml-1">4.9</span>
          </div>

          {/* Add to Cart button - dark with rounded corners */}
          <button 
            onClick={handleCart} 
            disabled={product.stock===0}
            style={{ 
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#1a1a2e',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: 'auto'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16213e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a2e'}
            disabled={product.stock===0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '-1px' }}>
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span style={{ lineHeight: '1', marginTop: '1px' }}>Add to Cart</span>
          </button>
        </div>
      </Link>
    </motion.div>
  )
}
